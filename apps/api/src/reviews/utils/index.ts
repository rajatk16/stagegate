import { createHash } from 'crypto';

export const createReviewerEligbilityId = (eventId: string, userId: string) =>
  createHash('sha256').update(`${eventId}\0${userId}`).digest('hex');

export const createReviewConflictId = (
  proposalId: string,
  reviewerUserId: string,
) =>
  createHash('sha256').update(`${proposalId}\0${reviewerUserId}`).digest('hex');

export const createReviewAssignmentId = (
  reviewPeriodId: string,
  proposalId: string,
  reviewerUserId: string,
) =>
  createHash('sha256')
    .update(`${reviewPeriodId}:${proposalId}:${reviewerUserId}`)
    .digest('hex');

export const createReviewSubmissionRevisionId = (
  assignmentId: string,
  revisionNumber: number,
): string => `${assignmentId}_${revisionNumber}`;
