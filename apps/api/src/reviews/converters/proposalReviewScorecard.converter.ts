import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';
import { ProposalFormat, ProposalStatus } from '@/submissions';

import { ProposalReviewScorecard } from '../entities';
import {
  ReviewConflictState,
  ReviewCoverageStatus,
  ReviewRecommendation,
  ProposalDecisionStatus,
} from '../enums';

export const proposalReviewScorecardConverter: FirestoreDataConverter<ProposalReviewScorecard> =
  {
    toFirestore: (scorecard: ProposalReviewScorecard) => ({
      ...scorecard,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();
      const recommendationDistribution = data.recommendationDistribution as
        Partial<Record<ReviewRecommendation, number>> | undefined;

      return {
        id: snapshot.id,

        eventId: data.eventId as string,
        cfpId: data.cfpId as string,
        reviewPeriodId: data.reviewPeriodId as string,
        proposalId: data.proposalId as string,

        proposalTitle: data.proposalTitle as string,
        proposalStatus: data.proposalStatus as ProposalStatus,
        proposalFormat: data.proposalFormat as ProposalFormat,
        trackId: (data.trackId as string | null | undefined) ?? null,

        requiredReviewCount: data.requiredReviewCount as number,
        assignedReviewCount: data.assignedReviewCount as number,
        inProgressReviewCount: data.inProgressReviewCount as number,
        submittedReviewCount: data.submittedReviewCount as number,
        overdueAssignmentCount: data.overdueAssignmentCount as number,
        coverageStatus: data.coverageStatus as ReviewCoverageStatus,

        scoredReviewCount: data.scoredReviewCount as number,
        weightedAverageScore:
          (data.weightedAverageScore as number | null | undefined) ?? null,
        recommendationDistribution: {
          [ReviewRecommendation.STRONG_ACCEPT]:
            recommendationDistribution?.[ReviewRecommendation.STRONG_ACCEPT] ??
            0,
          [ReviewRecommendation.ACCEPT]:
            recommendationDistribution?.[ReviewRecommendation.ACCEPT] ?? 0,
          [ReviewRecommendation.NEUTRAL]:
            recommendationDistribution?.[ReviewRecommendation.NEUTRAL] ?? 0,
          [ReviewRecommendation.REJECT]:
            recommendationDistribution?.[ReviewRecommendation.REJECT] ?? 0,
          [ReviewRecommendation.STRONG_REJECT]:
            recommendationDistribution?.[ReviewRecommendation.STRONG_REJECT] ??
            0,
        },
        declaredConflictCount: data.declaredConflictCount as number,
        confirmedConflictCount: data.confirmedConflictCount as number,
        conflictState: data.conflictState as ReviewConflictState,

        decisionStatus:
          (data.decisionStatus as ProposalDecisionStatus | undefined) ??
          ProposalDecisionStatus.UNDECIDED,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
