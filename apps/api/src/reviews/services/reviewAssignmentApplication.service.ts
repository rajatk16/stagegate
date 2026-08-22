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

import { ReviewAssignment } from '../entities';
import { CreateReviewAssignmentDto, RevokeReviewAssignmentDto } from '../dtos';
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
export class ReviewAssignmentApplicationService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly firebaseService: FirebaseService,
    private readonly proposalRepository: ProposalRepository,
    private readonly eventsDomainService: EventsDomainService,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly reviewConflictRepository: ReviewConflictRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly reviewAssignmentRepository: ReviewAssignmentRepository,
    private readonly reviewerEligibilityRepository: ReviewerEligibilityRepository,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}

  async createAssignment(
    organization: Organization,
    event: Event,
    actorUserId: string,
    reviewPeriodId: string,
    dto: CreateReviewAssignmentDto,
  ): Promise<ReviewAssignment> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const eventRef = this.eventRepository.getDocumentReference(event.id);
        const reviewPeriodRef =
          this.reviewPeriodRepository.getDocumentReference(reviewPeriodId);
        const proposalRef = this.proposalRepository.getDocumentReference(
          dto.proposalId,
        );
        const membershipRef =
          this.eventMembershipRepository.getDocumentReference(
            event.id,
            dto.reviewerUserId,
          );
        const eligibilityRef =
          this.reviewerEligibilityRepository.getDocumentReference(
            event.id,
            dto.reviewerUserId,
          );
        const conflictRef = this.reviewConflictRepository.getDocumentReference(
          dto.proposalId,
          dto.reviewerUserId,
        );
        const assignmentRef =
          this.reviewAssignmentRepository.getDocumentReference(
            reviewPeriodId,
            dto.proposalId,
            dto.reviewerUserId,
          );

        const [
          eventSnapshot,
          reviewPeriodSnapshot,
          proposalSnapshot,
          membershipSnapshot,
          eligibilitySnapshot,
          conflictSnapshot,
          assignmentSnapshot,
        ] = await Promise.all([
          transaction.get(eventRef),
          transaction.get(reviewPeriodRef),
          transaction.get(proposalRef),
          transaction.get(membershipRef),
          transaction.get(eligibilityRef),
          transaction.get(conflictRef),
          transaction.get(assignmentRef),
        ]);

        if (!eventSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.EVENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Event not found',
          );
        }

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!reviewPeriodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const reviewPeriod = reviewPeriodSnapshot.data()!;

        if (
          reviewPeriod.eventId !== event.id ||
          reviewPeriod.cfpId !== event.id
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        if (reviewPeriod.status !== ReviewPeriodStatus.OPEN) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_OPEN,
            HttpStatus.CONFLICT,
            'Assignments can only be created during an open review period',
          );
        }

        const now = Timestamp.now();

        if (
          reviewPeriod.closesAt &&
          reviewPeriod.closesAt.toMillis() <= now.toMillis()
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_OPEN,
            HttpStatus.CONFLICT,
            'The review period has reached its closing time',
          );
        }

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
          proposal.cfpId !== reviewPeriod.cfpId ||
          proposal.status !== ProposalStatus.SUBMITTED
        ) {
          throw new ApplicationException(
            ErrorCode.PROPOSAL_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Proposal not found',
          );
        }

        if (proposal.ownerUserId === dto.reviewerUserId) {
          throw new ApplicationException(
            ErrorCode.REVIEWER_CANNOT_REVIEW_OWN_PROPOSAL,
            HttpStatus.UNPROCESSABLE_ENTITY,
            'A reviewer cannot review their own proposal',
          );
        }

        if (!membershipSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.FORBIDDEN,
            HttpStatus.FORBIDDEN,
            'The assignee is not an active reviewer for this event',
          );
        }

        const membership = membershipSnapshot.data()!;

        if (
          membership.status !== EventMembershipStatus.ACTIVE ||
          membership.role !== EventRole.REVIEWER
        ) {
          throw new ApplicationException(
            ErrorCode.FORBIDDEN,
            HttpStatus.FORBIDDEN,
            'The assignee is not an active reviewer for this event',
          );
        }

        if (!eligibilitySnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEWER_NOT_ELIGIBLE,
            HttpStatus.UNPROCESSABLE_ENTITY,
            'The reviewer has not been marked eligible',
          );
        }

        const eligibility = eligibilitySnapshot.data()!;

        if (eligibility.status !== ReviewerEligibilityStatus.ELIGIBLE) {
          throw new ApplicationException(
            ErrorCode.REVIEWER_NOT_ELIGIBLE,
            HttpStatus.UNPROCESSABLE_ENTITY,
            'The reviewer is not eligible for assignments',
          );
        }

        if (conflictSnapshot.exists) {
          const conflict = conflictSnapshot.data()!;

          if (
            conflict.status === ConflictStatus.DECLARED ||
            conflict.status === ConflictStatus.CONFIRMED
          ) {
            throw new ApplicationException(
              ErrorCode.REVIEWER_CONFLICTED,
              HttpStatus.UNPROCESSABLE_ENTITY,
              'The reviewer has a conflict of interest for this proposal',
            );
          }
        }

        if (assignmentSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_ASSIGNMENT_ALREADY_EXISTS,
            HttpStatus.CONFLICT,
            'This reviewer has already been assigned this proposal in this review period',
          );
        }

        const requestedDueAt = dto.dueAt
          ? Timestamp.fromDate(new Date(dto.dueAt))
          : null;

        const dueAt = requestedDueAt ?? reviewPeriod.closesAt;

        if (dueAt && dueAt.toMillis() <= now.toMillis()) {
          throw new ApplicationException(
            ErrorCode.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
            'Assignment due time must be in the future',
          );
        }

        if (
          dueAt &&
          reviewPeriod.closesAt &&
          dueAt.toMillis() > reviewPeriod.closesAt.toMillis()
        ) {
          throw new ApplicationException(
            ErrorCode.VALIDATION_ERROR,
            HttpStatus.BAD_REQUEST,
            'Assignment due time cannot be after the review period closes',
          );
        }

        const assignment: ReviewAssignment = {
          id: assignmentRef.id,
          eventId: event.id,
          cfpId: reviewPeriod.cfpId,
          reviewPeriodId: reviewPeriod.id,
          proposalId: proposal.id,
          reviewerUserId: dto.reviewerUserId,

          status: ReviewAssignmentStatus.ASSIGNED,
          dueAt,

          assignedBy: actorUserId,
          assignedAt: now,
          startedAt: null,
          completedAt: null,
          declinedAt: null,
          revokedAt: null,
          revokedBy: null,
          revokeReason: null,

          createdAt: now,
          updatedAt: now,
        };

        transaction.create(assignmentRef, assignment);

        return assignment;
      },
    );
  }

  async revokeAssignment(
    organization: Organization,
    event: Event,
    actorUserId: string,
    assignmentId: string,
    dto: RevokeReviewAssignmentDto,
  ): Promise<ReviewAssignment> {
    this.organizationLifecyclePolicyService.assertWriteable(organization);
    this.eventsDomainService.assertEditable(event);

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

        this.eventsDomainService.assertEditable(eventSnapshot.data()!);

        if (!assignmentSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_ASSIGNMENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review assignment not found',
          );
        }

        const assignment = assignmentSnapshot.data()!;

        if (assignment.eventId !== event.id) {
          throw new ApplicationException(
            ErrorCode.REVIEW_ASSIGNMENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review assignment not found',
          );
        }

        const reviewPeriodRef =
          this.reviewPeriodRepository.getDocumentReference(
            assignment.reviewPeriodId,
          );

        const reviewPeriodSnapshot = await transaction.get(reviewPeriodRef);

        if (!reviewPeriodSnapshot.exists) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review period not found',
          );
        }

        const reviewPeriod = reviewPeriodSnapshot.data()!;

        if (
          reviewPeriod.eventId !== event.id ||
          reviewPeriod.cfpId !== assignment.cfpId
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_ASSIGNMENT_NOT_FOUND,
            HttpStatus.NOT_FOUND,
            'Review assignment not found',
          );
        }

        if (reviewPeriod.status === ReviewPeriodStatus.LOCKED) {
          throw new ApplicationException(
            ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
            HttpStatus.CONFLICT,
            'Assignments in a locked review period cannot be changed',
          );
        }

        if (
          assignment.status !== ReviewAssignmentStatus.ASSIGNED &&
          assignment.status !== ReviewAssignmentStatus.IN_PROGRESS
        ) {
          throw new ApplicationException(
            ErrorCode.REVIEW_ASSIGNMENT_NOT_ACTIVE,
            HttpStatus.CONFLICT,
            'Only active review assignments can be revoked',
          );
        }

        const now = Timestamp.now();

        const revokedAssignment: ReviewAssignment = {
          ...assignment,
          status: ReviewAssignmentStatus.REVOKED,
          revokedAt: now,
          revokedBy: actorUserId,
          revokeReason: dto.reason.trim(),
          updatedAt: now,
        };

        transaction.set(assignmentRef, revokedAssignment);

        return revokedAssignment;
      },
    );
  }
}
