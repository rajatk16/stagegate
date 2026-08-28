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

import { SubmitReviewDto, UpdateReviewDraftDto } from '../dtos';
import { ReviewerWorkloadProjectionService } from './reviewerWorkloadProjection.service';
import { ProposalReviewScorecardProjectionService } from './proposalReviewScorecardProjection.service';
import {
  ReviewDomainService,
  ValidatedReviewSubmission,
} from './reviewDomain.service';
import {
  ReviewStatus,
  ConflictStatus,
  ReviewAssignmentStatus,
  ReviewerEligibilityStatus,
} from '../enums';
import {
  Review,
  ReviewPeriod,
  ReviewCriterion,
  ReviewAssignment,
  ReviewSubmissionRevision,
} from '../entities';
import {
  ReviewRepository,
  ReviewPeriodRepository,
  ReviewConflictRepository,
  ReviewAssignmentRepository,
  ReviewerEligibilityRepository,
  ReviewSubmissionRevisionRepository,
} from '../repositories';

type ReviewerReviewContext = {
  assignment: ReviewAssignment;
  reviewPeriod: ReviewPeriod;
};

export type ReviewerReviewWorkspace = {
  review: Review | null;
  rubricSnapshot: ReviewCriterion[];
};

@Injectable()
export class ReviewApplicationService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly eventRepository: EventRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly proposalRepository: ProposalRepository,
    private readonly eventsDomainService: EventsDomainService,
    private readonly reviewDomainService: ReviewDomainService,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly reviewConflictRepository: ReviewConflictRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewerEligibilityRepository: ReviewerEligibilityRepository,
    private readonly reviewSubmissionRepository: ReviewSubmissionRevisionRepository,
    private readonly reviewerWorkloadProjectionService: ReviewerWorkloadProjectionService,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
    private readonly proposalReviewScorecardProjectionService: ProposalReviewScorecardProjectionService,
  ) {}

  async getOwnReview(
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
  ): Promise<ReviewerReviewWorkspace> {
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const context = await this.loadReviewerContext(
          transaction,
          event,
          reviewerUserId,
          assignmentId,
          false,
        );

        const reviewSnapshot = await transaction.get(
          this.reviewRepository.getDocumentReference(assignmentId),
        );

        return {
          review: reviewSnapshot.exists ? reviewSnapshot.data()! : null,
          rubricSnapshot: context.reviewPeriod.rubricSnapshot.map(
            (criterion) => ({
              id: criterion.id,
              label: criterion.label,
              description: criterion.description,
              weight: criterion.weight,
              minimumScore: criterion.minimumScore,
              maximumScore: criterion.maximumScore,
              displayOrder: criterion.displayOrder,
              required: criterion.required,
            }),
          ),
        };
      },
    );
  }

  async createDraft(
    organization: Organization,
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
  ): Promise<Review> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const context = await this.loadReviewerContext(
          transaction,
          event,
          reviewerUserId,
          assignmentId,
          true,
        );

        const now = Timestamp.now();

        this.reviewDomainService.assertReviewWindowOpen(
          context.reviewPeriod,
          now,
        );

        if (
          context.assignment.status !== ReviewAssignmentStatus.ASSIGNED &&
          context.assignment.status !== ReviewAssignmentStatus.IN_PROGRESS
        ) {
          throw this.assignmentNotFound();
        }

        const reviewRef =
          this.reviewRepository.getDocumentReference(assignmentId);
        const reviewSnapshot = await transaction.get(reviewRef);

        if (reviewSnapshot.exists) {
          const existingReview = reviewSnapshot.data()!;

          if (existingReview.status === ReviewStatus.DRAFT) {
            return existingReview;
          }

          throw new ApplicationException(
            ErrorCode.REVIEW_ALREADY_SUBMITTED,
            HttpStatus.CONFLICT,
            'A submitted review already exists for this assignment',
          );
        }

        const review: Review = {
          id: assignmentId,
          eventId: event.id,
          cfpId: context.assignment.cfpId,
          reviewPeriodId: context.assignment.reviewPeriodId,
          assignmentId,
          proposalId: context.assignment.proposalId,
          reviewerUserId,
          status: ReviewStatus.DRAFT,
          criterionScores: [],
          writtenFeedback: null,
          recommendation: null,
          currentRevisionNumber: 0,
          submittedAt: null,
          createdAt: now,
          updatedAt: now,
        };

        const updatedAssignment: ReviewAssignment = {
          ...context.assignment,
          status: ReviewAssignmentStatus.IN_PROGRESS,
          startedAt: context.assignment.startedAt ?? now,
          updatedAt: now,
        };

        const proposal = await this.proposalRepository.findById(
          context.assignment.proposalId,
        );

        if (!proposal) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const scorecard =
          await this.proposalReviewScorecardProjectionService.buildInTransaction(
            {
              transaction,
              proposal,
              reviewPeriod: context.reviewPeriod,
              now,
              overrides: {
                assignments: [updatedAssignment],
              },
            },
          );

        const workload =
          await this.reviewerWorkloadProjectionService.buildInTransaction({
            transaction,
            reviewPeriodId: context.reviewPeriod.id,
            reviewerUserId: updatedAssignment.reviewerUserId,
            now,
            assignmentOverrides: [updatedAssignment],
          });

        transaction.create(reviewRef, review);

        this.proposalReviewScorecardProjectionService.saveInTransaction(
          transaction,
          scorecard,
        );

        this.reviewerWorkloadProjectionService.saveInTransaction(
          transaction,
          workload,
        );

        transaction.set(
          this.reviewAssignmentRepository.getDocumentReferenceById(
            assignmentId,
          ),
          updatedAssignment,
        );

        return review;
      },
    );
  }

  async updateDraft(
    organization: Organization,
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
    dto: UpdateReviewDraftDto,
  ): Promise<Review> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const context = await this.loadReviewerContext(
          transaction,
          event,
          reviewerUserId,
          assignmentId,
          true,
        );

        const now = Timestamp.now();

        this.reviewDomainService.assertReviewWindowOpen(
          context.reviewPeriod,
          now,
        );

        if (context.assignment.status !== ReviewAssignmentStatus.IN_PROGRESS) {
          throw this.assignmentNotFound();
        }

        const reviewRef =
          this.reviewRepository.getDocumentReference(assignmentId);
        const reviewSnapshot = await transaction.get(reviewRef);

        if (!reviewSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review draft not found',
          );
        }

        const review = reviewSnapshot.data()!;

        this.assertReviewOwnership(review, context.assignment, reviewerUserId);

        this.reviewDomainService.assertDraft(review);

        const update = this.reviewDomainService.normalizeDraftUpdate(
          context.reviewPeriod,
          dto,
        );

        const updatedReview: Review = {
          ...review,
          ...update,
          updatedAt: now,
        };

        transaction.set(reviewRef, updatedReview);

        return updatedReview;
      },
    );
  }

  async submitReview(
    organization: Organization,
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
    dto: SubmitReviewDto,
  ) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const context = await this.loadReviewerContext(
          transaction,
          event,
          reviewerUserId,
          assignmentId,
          true,
        );

        const now = Timestamp.now();

        this.reviewDomainService.assertReviewWindowOpen(
          context.reviewPeriod,
          now,
        );

        if (context.assignment.status !== ReviewAssignmentStatus.IN_PROGRESS) {
          throw this.assignmentNotFound();
        }

        const reviewRef =
          this.reviewRepository.getDocumentReference(assignmentId);
        const reviewSnapshot = await transaction.get(reviewRef);

        if (!reviewSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review draft not found',
          );
        }

        const review = reviewSnapshot.data()!;

        this.assertReviewOwnership(review, context.assignment, reviewerUserId);

        if (review.status === ReviewStatus.SUBMITTED) {
          throw new ApplicationException(
            ErrorCode.REVIEW_ALREADY_SUBMITTED,
            HttpStatus.CONFLICT,
            'This review has already been submitted',
          );
        }

        this.reviewDomainService.assertDraft(review);

        const submission = this.reviewDomainService.validateSubmission(
          context.reviewPeriod,
          dto,
        );

        const revisionNumber = review.currentRevisionNumber + 1;

        const revisionRef =
          this.reviewSubmissionRepository.getDocumentReference(
            assignmentId,
            revisionNumber,
          );

        const submittedReview: Review = {
          ...review,
          status: ReviewStatus.SUBMITTED,
          criterionScores: submission.criterionScores,
          writtenFeedback: submission.writtenFeedback,
          recommendation: submission.recommendation,
          currentRevisionNumber: revisionNumber,
          submittedAt: now,
          updatedAt: now,
        };

        const revision = this.createRevision(
          submittedReview,
          context.reviewPeriod,
          submission,
          now,
        );

        const completedAssignment: ReviewAssignment = {
          ...context.assignment,
          status: ReviewAssignmentStatus.COMPLETED,
          completedAt: now,
          updatedAt: now,
        };

        const proposal = await this.proposalRepository.findById(
          context.assignment.proposalId,
        );

        if (!proposal) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const scorecard =
          await this.proposalReviewScorecardProjectionService.buildInTransaction(
            {
              transaction,
              proposal,
              reviewPeriod: context.reviewPeriod,
              now,
              overrides: {
                assignments: [completedAssignment],
                submittedRevisions: [revision],
              },
            },
          );

        const workload =
          await this.reviewerWorkloadProjectionService.buildInTransaction({
            transaction,
            reviewPeriodId: context.reviewPeriod.id,
            reviewerUserId: completedAssignment.reviewerUserId,
            now,
            assignmentOverrides: [completedAssignment],
          });

        transaction.set(reviewRef, submittedReview);

        transaction.create(revisionRef, revision);

        this.proposalReviewScorecardProjectionService.saveInTransaction(
          transaction,
          scorecard,
        );

        this.reviewerWorkloadProjectionService.saveInTransaction(
          transaction,
          workload,
        );

        transaction.set(
          this.reviewAssignmentRepository.getDocumentReferenceById(
            assignmentId,
          ),
          completedAssignment,
        );
        return submittedReview;
      },
    );
  }

  async reopenSubmittedReview(
    organization: Organization,
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
  ) {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const context = await this.loadReviewerContext(
          transaction,
          event,
          reviewerUserId,
          assignmentId,
          true,
        );

        const now = Timestamp.now();

        if (context.assignment.status !== ReviewAssignmentStatus.COMPLETED) {
          throw this.assignmentNotFound();
        }

        const reviewRef =
          this.reviewRepository.getDocumentReference(assignmentId);

        const reviewSnapshot = await transaction.get(reviewRef);

        if (!reviewSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Submitted review not found',
          );
        }

        const review = reviewSnapshot.data()!;

        this.assertReviewOwnership(review, context.assignment, reviewerUserId);

        this.reviewDomainService.assertRevisionAllowed(
          context.reviewPeriod,
          review,
          now,
        );

        const reopenedReview: Review = {
          ...review,
          status: ReviewStatus.DRAFT,
          submittedAt: null,
          updatedAt: now,
        };

        const reopenedAssignment: ReviewAssignment = {
          ...context.assignment,
          status: ReviewAssignmentStatus.IN_PROGRESS,
          completedAt: null,
          updatedAt: now,
        };

        const proposal = await this.proposalRepository.findById(
          context.assignment.proposalId,
        );

        if (!proposal) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        const scorecard =
          await this.proposalReviewScorecardProjectionService.buildInTransaction(
            {
              transaction,
              proposal,
              reviewPeriod: context.reviewPeriod,
              now,
              overrides: {
                assignments: [reopenedAssignment],
              },
            },
          );

        const workload =
          await this.reviewerWorkloadProjectionService.buildInTransaction({
            transaction,
            reviewPeriodId: context.reviewPeriod.id,
            reviewerUserId: reopenedAssignment.reviewerUserId,
            now,
            assignmentOverrides: [reopenedAssignment],
          });

        transaction.set(reviewRef, reopenedReview);

        this.proposalReviewScorecardProjectionService.saveInTransaction(
          transaction,
          scorecard,
        );

        this.reviewerWorkloadProjectionService.saveInTransaction(
          transaction,
          workload,
        );

        transaction.set(
          this.reviewAssignmentRepository.getDocumentReferenceById(
            assignmentId,
          ),
          reopenedAssignment,
        );

        return reopenedReview;
      },
    );
  }

  private createRevision(
    review: Review,
    reviewPeriod: ReviewPeriod,
    submission: ValidatedReviewSubmission,
    now: Timestamp,
  ): ReviewSubmissionRevision {
    return {
      id: `${review.assignmentId}_${review.currentRevisionNumber}`,
      reviewId: review.id,
      eventId: review.eventId,
      cfpId: review.cfpId,
      reviewPeriodId: review.reviewPeriodId,
      assignmentId: review.assignmentId,
      proposalId: review.proposalId,
      reviewerUserId: review.reviewerUserId,
      revisionNumber: review.currentRevisionNumber,
      rubricVersion: reviewPeriod.rubricVersion,
      rubricSnapshot: reviewPeriod.rubricSnapshot.map((criterion) => ({
        id: criterion.id,
        label: criterion.label,
        description: criterion.description,
        weight: criterion.weight,
        minimumScore: criterion.minimumScore,
        maximumScore: criterion.maximumScore,
        displayOrder: criterion.displayOrder,
        required: criterion.required,
      })),
      criterionScores: submission.criterionScores,
      writtenFeedback: submission.writtenFeedback,
      recommendation: submission.recommendation,
      submittedAt: now,
      createdAt: now,
    };
  }

  private async loadReviewerContext(
    transaction: FirebaseFirestore.Transaction,
    event: Event,
    reviewerUserId: string,
    assignmentId: string,
    requiresWritableEvent: boolean,
  ): Promise<ReviewerReviewContext> {
    const eventRef = this.eventRepository.getDocumentReference(event.id);
    const assignmentRef =
      this.reviewAssignmentRepository.getDocumentReferenceById(assignmentId);

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

    if (requiresWritableEvent) {
      this.eventsDomainService.assertEditable(eventSnapshot.data()!);
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

    const reviewPeriodRef = this.reviewPeriodRepository.getDocumentReference(
      assignment.reviewPeriodId,
    );
    const proposalRef = this.proposalRepository.getDocumentReference(
      assignment.proposalId,
    );
    const membershipRef = this.eventMembershipRepository.getDocumentReference(
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

    if (!reviewPeriodSnapshot.exists || !proposalSnapshot.exists) {
      throw this.assignmentNotFound();
    }

    const reviewPeriod = reviewPeriodSnapshot.data()!;
    const proposal = proposalSnapshot.data()!;

    if (
      reviewPeriod.eventId !== event.id ||
      reviewPeriod.cfpId !== assignment.cfpId ||
      proposal.eventId !== event.id ||
      proposal.cfpId !== assignment.cfpId ||
      proposal.status !== ProposalStatus.SUBMITTED ||
      proposal.ownerUserId === reviewerUserId
    ) {
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

    if (
      eligibilitySnapshot.data()!.status !== ReviewerEligibilityStatus.ELIGIBLE
    ) {
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

    return {
      assignment,
      reviewPeriod,
    };
  }

  private assertReviewOwnership(
    review: Review,
    assignment: ReviewAssignment,
    reviewerUserId: string,
  ): void {
    if (
      review.id !== assignment.id ||
      review.assignmentId !== assignment.id ||
      review.eventId !== assignment.eventId ||
      review.cfpId !== assignment.cfpId ||
      review.reviewPeriodId !== assignment.reviewPeriodId ||
      review.proposalId !== assignment.proposalId ||
      review.reviewerUserId !== reviewerUserId
    ) {
      throw this.assignmentNotFound();
    }
  }

  private assignmentNotFound(): ApplicationException {
    return new ApplicationException(
      ErrorCode.REVIEW_ASSIGNMENT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      'Review assignment not found',
    );
  }
}
