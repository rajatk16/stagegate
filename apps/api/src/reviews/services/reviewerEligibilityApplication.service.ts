import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventRole } from '@/auth';
import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode } from '@/common';
import {
  Organization,
  OrganizationLifecyclePolicyService,
} from '@/organizations';
import {
  Event,
  EventRepository,
  EventsDomainService,
  EventMembershipStatus,
  EventMembershipRepository,
} from '@/events';

import { SetReviewerEligibilityDto } from '../dtos';
import { ReviewAssignment, ReviewerEligibility } from '../entities';
import {
  ReviewPeriodStatus,
  ReviewAssignmentStatus,
  ReviewerEligibilityStatus,
} from '../enums';
import {
  ReviewPeriodRepository,
  ReviewAssignmentRepository,
  ReviewerEligibilityRepository,
} from '../repositories';

@Injectable()
export class ReviewerEligibilityApplicationService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly firebaseService: FirebaseService,
    private readonly eventsDomainService: EventsDomainService,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewerEligibilityRepository: ReviewerEligibilityRepository,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}

  async setEligibility(
    organization: Organization,
    event: Event,
    actorUserId: string,
    reviewerUserId: string,
    dto: SetReviewerEligibilityDto,
  ) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const membershipRef =
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            reviewerUserId,
          );
        const eligibilityRef =
          this.reviewerEligibilityRepository.getDocumentReference(
            event.id,
            reviewerUserId,
          );
        const activeAssignmentsQuery =
          this.reviewAssignmentRepository.getActiveByEventAndReviewerQuery(
            event.id,
            reviewerUserId,
          );

        const [
          eventSnapshot,
          membershipSnapshot,
          eligibilitySnapshot,
          assignmentSnapshot,
        ] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(membershipRef),
          transaction.get(eligibilityRef),
          transaction.get(activeAssignmentsQuery),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!membershipSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.MEMBERSHIP_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Reviewer event membership not found',
          );
        }

        const membership = membershipSnapshot.data()!;

        if (
          membership.status !== EventMembershipStatus.ACTIVE ||
          membership.role !== EventRole.REVIEWER
        ) {
          throw new ApplicationException(
            ErrorCode.FORBIDDEN,
            HttpStatus.CONFLICT,
            'Only active event reviewers can be made eligible',
          );
        }

        const now = Timestamp.now();
        const existingEligibility = eligibilitySnapshot.exists
          ? eligibilitySnapshot.data()!
          : null;

        const eligibility: ReviewerEligibility = {
          id: existingEligibility?.id ?? `${event.id}_${reviewerUserId}`,
          eventId: event.id,
          userId: reviewerUserId,
          status: dto.status,
          reason:
            dto.status === ReviewerEligibilityStatus.INELIGIBLE
              ? dto.reason!.trim()
              : null,
          updatedBy: actorUserId,
          createdAt: existingEligibility?.createdAt ?? now,
          updatedAt: now,
        };

        const activeAssignments = assignmentSnapshot.docs.map((doc) =>
          doc.data(),
        );

        const reviewPeriodIds = [
          ...new Set(
            activeAssignments.map((assignment) => assignment.reviewPeriodId),
          ),
        ];

        const reviewPeriodSnapshots = await Promise.all(
          reviewPeriodIds.map((reviewPeriodId) =>
            transaction.get(
              this.reviewPeriodRepository.getDocumentReference(reviewPeriodId),
            ),
          ),
        );

        const periodStatusById = new Map(
          reviewPeriodSnapshots
            .filter((snapshot) => snapshot.exists)
            .map((snapshot) => [snapshot.id, snapshot.data()!.status]),
        );

        transaction.set(eligibilityRef, eligibility);

        if (dto.status === ReviewerEligibilityStatus.INELIGIBLE) {
          for (const assignment of activeAssignments) {
            const periodStatus = periodStatusById.get(
              assignment.reviewPeriodId,
            );

            if (periodStatus === ReviewPeriodStatus.LOCKED) {
              continue;
            }

            this.revokeAssignment(
              transaction,
              assignment,
              actorUserId,
              now,
              'Reviewer eligibility was revoked',
            );
          }
        }

        return eligibility;
      },
    );
  }

  private revokeAssignment(
    transaction: FirebaseFirestore.Transaction,
    assignment: ReviewAssignment,
    actorUserId: string,
    now: Timestamp,
    reason: string,
  ) {
    if (
      assignment.status !== ReviewAssignmentStatus.ASSIGNED &&
      assignment.status !== ReviewAssignmentStatus.IN_PROGRESS
    ) {
      return;
    }

    transaction.update(
      this.reviewAssignmentRepository.getDocumentReferenceById(assignment.id),
      {
        status: ReviewAssignmentStatus.REVOKED,
        revokedAt: now,
        revokedBy: actorUserId,
        revokeReason: reason,
        updatedAt: now,
      },
    );
  }
}
