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

export const createProposalReviewScorecardId = (
  reviewPeriodId: string,
  proposalId: string,
): string =>
  createHash('sha256').update(`${reviewPeriodId}:${proposalId}`).digest('hex');

export const createReviewerWorkloadId = (
  reviewPeriodId: string,
  reviewerUserId: string,
): string =>
  createHash('sha256')
    .update(`${reviewPeriodId}\0${reviewerUserId}`)
    .digest('hex');

export const createProposalDecisionId = (
  decisionRoundId: string,
  proposalId: string,
): string =>
  createHash('sha256')
    .update(`${decisionRoundId}\0${proposalId}`)
    .digest('hex');

export const createProposalDecisionRevisionId = (
  proposalDecisionId: string,
  revisionNumber: number,
): string =>
  createHash('sha256')
    .update(`${proposalDecisionId}\0${revisionNumber}`)
    .digest('hex');
