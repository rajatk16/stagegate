import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventRole } from '@/auth';
import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode } from '@/common';
import { ProposalRepository, ProposalStatus } from '@/submissions';
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

import { ReviewAssignment, ReviewConflict } from '../entities';
import { DeclareConflictDto, ResolveConflictDto } from '../dtos';
import {
  ConflictStatus,
  ReviewPeriodStatus,
  ReviewAssignmentStatus,
} from '../enums';
import {
  ReviewPeriodRepository,
  ReviewConflictRepository,
  ReviewAssignmentRepository,
} from '../repositories';

@Injectable()
export class ReviewConflictApplicationService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly firebaseService: FirebaseService,
    private readonly proposalRepository: ProposalRepository,
    private readonly eventsDomainService: EventsDomainService,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly reviewConflictRepository: ReviewConflictRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}
  async declareConflict(
    organization: Organization,
    event: Event,
    reviewerUserId: string,
    proposalId: string,
    dto: DeclareConflictDto,
  ): Promise<ReviewConflict> {
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
        const proposalRef =
          this.proposalRepository.getDocumentReference(proposalId);
        const conflictRef = this.reviewConflictRepository.getDocumentReference(
          proposalId,
          reviewerUserId,
        );
        const activeAssignmentsQuery =
          this.reviewAssignmentRepository.getActiveByProposalAndReviewerQuery(
            proposalId,
            reviewerUserId,
          );

        const [
          eventSnapshot,
          membershipSnapshot,
          proposalSnapshot,
          conflictSnapshot,
          assignmentSnapshot,
        ] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(membershipRef),
          transaction.get(proposalRef),
          transaction.get(conflictRef),
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
        this.assertActiveReviewerMembership(membershipSnapshot);

        if (!proposalSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const proposal = proposalSnapshot.data()!;

        if (
          proposal.eventId !== event.id ||
          proposal.status !== ProposalStatus.SUBMITTED
        ) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const now = Timestamp.now();
        const existingConflict = conflictSnapshot.exists
          ? conflictSnapshot.data()!
          : null;

        if (existingConflict?.status === ConflictStatus.CONFIRMED) {
          return existingConflict;
        }

        const conflict: ReviewConflict = {
          id: existingConflict?.id ?? `${proposal.id}_${reviewerUserId}`,
          eventId: event.id,
          cfpId: proposal.cfpId,
          proposalId: proposal.id,
          reviewerUserId,
          status: ConflictStatus.DECLARED,
          reason: dto.reason?.trim() ?? null,
          declaredAt: existingConflict?.declaredAt ?? now,
          resolvedAt: null,
          resolvedBy: null,
          resolutionNote: null,
          createdAt: existingConflict?.createdAt ?? now,
          updatedAt: now,
        };

        const activeAssignments = assignmentSnapshot.docs.map((doc) =>
          doc.data(),
        );

        const periodStatusById = await this.getPeriodStatusById(
          transaction,
          activeAssignments,
        );

        transaction.set(conflictRef, conflict);

        const revokedAssignments = this.revokeActiveAssignments(
          activeAssignments,
          periodStatusById,
          reviewerUserId,
          now,
          'Reviewer declared a conflict of interest',
        );

        for (const assignment of revokedAssignments) {
          transaction.update(
            this.reviewAssignmentRepository.getDocumentReferenceById(
              assignment.id,
            ),
            {
              ...assignment,
            },
          );
        }

        return conflict;
      },
    );
  }

  async resolveConflict(
    organization: Organization,
    event: Event,
    actorUserId: string,
    proposalId: string,
    reviewerUserId: string,
    dto: ResolveConflictDto,
  ): Promise<ReviewConflict> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const proposalRef =
          this.proposalRepository.getDocumentReference(proposalId);
        const conflictRef = this.reviewConflictRepository.getDocumentReference(
          proposalId,
          reviewerUserId,
        );
        const activeAssignmentsQuery =
          this.reviewAssignmentRepository.getActiveByProposalAndReviewerQuery(
            proposalId,
            reviewerUserId,
          );

        const [
          eventSnapshot,
          proposalSnapshot,
          conflictSnapshot,
          assignmentSnapshot,
        ] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(proposalRef),
          transaction.get(conflictRef),
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

        if (!proposalSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const proposal = proposalSnapshot.data()!;

        if (proposal.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        if (!conflictSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_CONFLICT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review conflict not found',
          );
        }

        const conflict = conflictSnapshot.data()!;

        if (
          conflict.eventId !== event.id ||
          conflict.proposalId !== proposalId ||
          conflict.reviewerUserId !== reviewerUserId
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_CONFLICT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review conflict not found',
          );
        }

        if (
          conflict.status !== ConflictStatus.DECLARED &&
          conflict.status !== ConflictStatus.CONFIRMED
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_CONFLICT_INVALID_STATE,
            HttpStatus.CONFLICT,
            'Only declared or confirmed conflicts can be resolved',
          );
        }

        const now = Timestamp.now();

        const updatedConflict: ReviewConflict = {
          ...conflict,
          status: dto.status,
          resolvedAt: now,
          resolvedBy: actorUserId,
          resolutionNote: dto.resolutionNote?.trim() ?? null,
          updatedAt: now,
        };

        const activeAssignments = assignmentSnapshot.docs.map((document) =>
          document.data(),
        );

        const periodStatusById = await this.getPeriodStatusById(
          transaction,
          activeAssignments,
        );

        transaction.set(conflictRef, updatedConflict);

        if (dto.status === ConflictStatus.CONFIRMED) {
          const revokedAssignments = this.revokeActiveAssignments(
            activeAssignments,
            periodStatusById,
            actorUserId,
            now,
            'Conflict of interest was confirmed by a program chair',
          );

          for (const assignment of revokedAssignments) {
            transaction.update(
              this.reviewAssignmentRepository.getDocumentReferenceById(
                assignment.id,
              ),
              {
                ...assignment,
              },
            );
          }
        }
        return updatedConflict;
      },
    );
  }

  private assertActiveReviewerMembership(
    membershipSnapshot: FirebaseFirestore.DocumentSnapshot,
  ): void {
    if (!membershipSnapshot.exists) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Active reviewer membership is required',
      );
    }

    const membership = membershipSnapshot.data();

    if (
      !membership ||
      membership.status !== EventMembershipStatus.ACTIVE ||
      membership.role !== EventRole.REVIEWER
    ) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Active reviewer membership is required',
      );
    }
  }

  private async getPeriodStatusById(
    transaction: FirebaseFirestore.Transaction,
    assignments: ReviewAssignment[],
  ): Promise<Map<string, ReviewPeriodStatus>> {
    const reviewPeriodIds = [
      ...new Set(assignments.map((assignment) => assignment.reviewPeriodId)),
    ];

    const snapshots = await Promise.all(
      reviewPeriodIds.map((reviewPeriodId) =>
        transaction.get(
          this.reviewPeriodRepository.getDocumentReference(reviewPeriodId),
        ),
      ),
    );

    return new Map(
      snapshots
        .filter((snapshot) => snapshot.exists)
        .map((snapshot) => [snapshot.id, snapshot.data()!.status]),
    );
  }

  private revokeActiveAssignments(
    assignments: ReviewAssignment[],
    periodStatusById: Map<string, ReviewPeriodStatus>,
    actorUserId: string,
    now: Timestamp,
    reason: string,
  ): ReviewAssignment[] {
    return assignments.flatMap((assignment) => {
      const periodStatus = periodStatusById.get(assignment.reviewPeriodId);

      if (
        periodStatus === ReviewPeriodStatus.LOCKED ||
        (assignment.status !== ReviewAssignmentStatus.ASSIGNED &&
          assignment.status !== ReviewAssignmentStatus.IN_PROGRESS)
      ) {
        return [];
      }

      return [
        {
          ...assignment,
          status: ReviewAssignmentStatus.REVOKED,
          revokedAt: now,
          revokedBy: actorUserId,
          revokeReason: reason,
          updatedAt: now,
        },
      ];
    });
  }
}
