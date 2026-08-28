import { ProposalFormat, ProposalStatus } from '@/submissions';
import {
  ProposalDecisionStatus,
  ReviewConflictState,
  ReviewCoverageStatus,
  ReviewRecommendation,
} from '../enums';

export class ChairScorecardResponseDto {
  proposalId: string;
  proposalTitle: string;
  trackId: string | null;
  proposalFormat: ProposalFormat;
  proposalStatus: ProposalStatus;

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
  updatedAt: string;
}

export class ChairScorecardPageResponseDto {
  items: ChairScorecardResponseDto[];
  nextCursor: string | null;
}
