import { Timestamp } from 'firebase-admin/firestore';

import { ProposalFormat, ProposalStatus } from '@/submissions';

import {
  ReviewConflictState,
  ReviewCoverageStatus,
  ReviewRecommendation,
  ProposalDecisionStatus,
} from '../enums';

export class ProposalReviewScorecard {
  id: string;

  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  proposalId: string;

  proposalTitle: string;
  proposalStatus: ProposalStatus;
  proposalFormat: ProposalFormat;
  trackId: string | null;

  requiredReviewCount: number;
  assignedReviewCount: number;
  inProgressReviewCount: number;
  submittedReviewCount: number;
  overdueAssignmentCount: number;

  coverageStatus: ReviewCoverageStatus;

  scoredReviewCount: number;
  weightedAverageScore: number | null;

  recommendationDistribution: Record<ReviewRecommendation, number>;

  declaredConflictCount: number;
  confirmedConflictCount: number;
  conflictState: ReviewConflictState;

  decisionStatus: ProposalDecisionStatus;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
