import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventRole } from '@/auth';
import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode } from '@/common';
import { ProposalRepository, ProposalStatus } from '@/submissions';
import {
  Event,
  EventRepository,
  EventMembershipStatus,
  EventMembershipRepository,
} from '@/events';

import { ReviewerProposalViewResponseDto } from '../dtos';
import {
  ConflictStatus,
  ReviewPeriodStatus,
  ReviewAssignmentStatus,
  ReviewerEligibilityStatus,
} from '../enums';
import {
  ReviewPeriodRepository,
  ReviewConflictRepository,
  ReviewAssignmentRepository,
  ReviewerEligibilityRepository,
} from '../repositories';

@Injectable()
export class ReviewerProposalViewService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly firebaseService: FirebaseService,
    private readonly proposalRepository: ProposalRepository,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly reviewConflictRepository: ReviewConflictRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewerEligibilityRepository: ReviewerEligibilityRepository,
  ) {}

  async getAssignmedProposalView(
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
  ): Promise<ReviewerProposalViewResponseDto> {
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const assignmentRef =
          this.reviewAssignmentRepository.getDocumentReferenceById(
            assignmentId,
          );

        const [eventSnapshot, assignmentSnapshot] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(assignmentRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        if (!assignmentSnapshot.exists) {
          throw this.assignmentNotFound();
        }

        const assignment = assignmentSnapshot.data()!;

        if (
          assignment.eventId !== event.id ||
          assignment.reviewerUserId !== reviewerUserId
        ) {
          throw this.assignmentNotFound();
        }

        const reviewPeriodRef =
          this.reviewPeriodRepository.getDocumentReference(
            assignment.reviewPeriodId,
          );

        const proposalRef = this.proposalRepository.getDocumentReference(
          assignment.proposalId,
        );

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

        const conflictRef = this.reviewConflictRepository.getDocumentReference(
          assignment.proposalId,
          reviewerUserId,
        );

        const [
          reviewPeriodSnapshot,
          proposalSnapshot,
          membershipSnapshot,
          eligibilitySnapshot,
          conflictSnapshot,
        ] = await Promise.all([
          transaction.get(reviewPeriodRef),
          transaction.get(proposalRef),
          transaction.get(membershipRef),
          transaction.get(eligibilityRef),
          transaction.get(conflictRef),
        ]);

        if (!reviewPeriodSnapshot.exists) {
          throw this.assignmentNotFound();
        }

        const reviewPeriod = reviewPeriodSnapshot.data()!;

        if (
          reviewPeriod.eventId !== event.id ||
          reviewPeriod.cfpId !== assignment.cfpId
        ) {
          throw this.assignmentNotFound();
        }

        const now = Timestamp.now();

        if (
          reviewPeriod.status !== ReviewPeriodStatus.OPEN ||
          (reviewPeriod.opensAt &&
            reviewPeriod.opensAt.toMillis() > now.toMillis()) ||
          (reviewPeriod.closesAt &&
            reviewPeriod.closesAt.toMillis() <= now.toMillis())
        ) {
          throw this.assignmentNotFound();
        }

        const assignmentIsActionable =
          assignment.status === ReviewAssignmentStatus.ASSIGNED ||
          assignment.status === ReviewAssignmentStatus.IN_PROGRESS;

        const submittedReviewCanBeReopened =
          assignment.status === ReviewAssignmentStatus.COMPLETED &&
          reviewPeriod.allowSubmittedReviewRevisions;

        if (!assignmentIsActionable && !submittedReviewCanBeReopened) {
          throw this.assignmentNotFound();
        }

        if (!membershipSnapshot.exists) {
          throw this.assignmentNotFound();
        }

        const membership = membershipSnapshot.data()!;

        if (
          membership.status !== EventMembershipStatus.ACTIVE ||
          membership.role !== EventRole.REVIEWER
        ) {
          throw this.assignmentNotFound();
        }

        if (!eligibilitySnapshot.exists) {
          throw this.assignmentNotFound();
        }

        const eligibility = eligibilitySnapshot.data()!;

        if (eligibility.status !== ReviewerEligibilityStatus.ELIGIBLE) {
          throw this.assignmentNotFound();
        }

        if (conflictSnapshot.exists) {
          const conflict = conflictSnapshot.data()!;

          if (
            conflict.status === ConflictStatus.DECLARED ||
            conflict.status === ConflictStatus.CONFIRMED
          ) {
            throw this.assignmentNotFound();
          }
        }

        if (!proposalSnapshot.exists) {
          throw this.assignmentNotFound();
        }

        const proposal = proposalSnapshot.data()!;

        if (
          proposal.eventId !== event.id ||
          proposal.cfpId !== assignment.cfpId ||
          proposal.status !== ProposalStatus.SUBMITTED
        ) {
          throw this.assignmentNotFound();
        }

        return {
          title: proposal.title,
          abstract: proposal.abstract,
          description: proposal.description,
          format: proposal.format,
          durationMinutes: proposal.durationMinutes,
          language: proposal.language,
        };
      },
    );
  }

  private assignmentNotFound(): ApplicationException {
    return new ApplicationException(
      ErrorCode.REVIEW_ASSIGNMENT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      'Review assignment not found',
    );
  }
}
