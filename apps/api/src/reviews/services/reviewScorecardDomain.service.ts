import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';

import { Proposal } from '@/submissions';

import { createProposalReviewScorecardId } from '../utils';
import {
  ReviewPeriod,
  ReviewConflict,
  ReviewCriterion,
  ReviewAssignment,
  ProposalReviewScorecard,
  ReviewSubmissionRevision,
} from '../entities';
import {
  ConflictStatus,
  ReviewConflictState,
  ReviewCoverageStatus,
  ReviewRecommendation,
  ProposalDecisionStatus,
  ReviewAssignmentStatus,
} from '../enums';

type BuildScorecardInput = {
  proposal: Proposal;
  reviewPeriod: ReviewPeriod;
  assignments: ReviewAssignment[];
  conflicts: ReviewConflict[];
  submittedRevisions: ReviewSubmissionRevision[];
  existingScorecard: ProposalReviewScorecard | null;
  now: Timestamp;
};

@Injectable()
export class ReviewScorecardDomainService {
  build(input: BuildScorecardInput) {
    const {
      proposal,
      reviewPeriod,
      assignments,
      conflicts,
      submittedRevisions,
      existingScorecard,
      now,
    } = input;

    const scopedAssignments = assignments.filter(
      (assignment) =>
        assignment.eventId === proposal.eventId &&
        assignment.cfpId === proposal.cfpId &&
        assignment.reviewPeriodId === reviewPeriod.id &&
        assignment.proposalId === proposal.id,
    );

    const scopedConflicts = conflicts.filter(
      (conflict) =>
        conflict.eventId === proposal.eventId &&
        conflict.cfpId === proposal.cfpId &&
        conflict.proposalId === proposal.id,
    );

    const activeConflictsByReviewer =
      this.getActiveConflictsByReviewer(scopedConflicts);

    const assignedAssignments = scopedAssignments.filter(
      (assignment) =>
        assignment.status === ReviewAssignmentStatus.ASSIGNED ||
        assignment.status === ReviewAssignmentStatus.IN_PROGRESS ||
        assignment.status === ReviewAssignmentStatus.COMPLETED,
    );

    const inProgressAssignments = scopedAssignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.IN_PROGRESS,
    );

    const overdueAssignments = scopedAssignments.filter(
      (assignment) =>
        (assignment.status === ReviewAssignmentStatus.ASSIGNED ||
          assignment.status === ReviewAssignmentStatus.IN_PROGRESS) &&
        assignment.dueAt !== null &&
        assignment.dueAt.toMillis() < now.toMillis(),
    );

    const latestRevisionByAssignment = this.getLatestRevisionByAssignment(
      submittedRevisions,
      proposal,
      reviewPeriod,
    );

    const completedAssignments = scopedAssignments.filter(
      (assignment) => assignment.status === ReviewAssignmentStatus.COMPLETED,
    );

    const validSubmittedRevisions = completedAssignments.flatMap(
      (assignment) => {
        if (activeConflictsByReviewer.has(assignment.reviewerUserId)) {
          return [];
        }

        const revision = latestRevisionByAssignment.get(assignment.id);

        if (!revision) {
          return [];
        }

        return [revision];
      },
    );

    const recommendationDistribution = this.createRecommendationDistribution();

    const reviewScores: number[] = [];

    for (const revision of validSubmittedRevisions) {
      recommendationDistribution[revision.recommendation] += 1;

      const score = this.calculateWeightedReviewScore(revision);

      if (score !== null) {
        reviewScores.push(score);
      }
    }

    const declaredConflictCount = scopedConflicts.filter(
      (conflict) => conflict.status === ConflictStatus.DECLARED,
    ).length;

    const confirmedConflictCount = scopedConflicts.filter(
      (conflict) => conflict.status === ConflictStatus.CONFIRMED,
    ).length;

    return {
      id: createProposalReviewScorecardId(reviewPeriod.id, proposal.id),
      eventId: proposal.eventId,
      cfpId: proposal.cfpId,
      reviewPeriodId: reviewPeriod.id,
      proposalId: proposal.id,

      proposalTitle: proposal.title,
      proposalStatus: proposal.status,
      proposalFormat: proposal.format,
      trackId: proposal.trackId,

      requiredReviewCount: reviewPeriod.requiredReviewsPerProposal,
      assignedReviewCount: assignedAssignments.length,
      inProgressReviewCount: inProgressAssignments.length,
      submittedReviewCount: validSubmittedRevisions.length,
      overdueAssignmentCount: overdueAssignments.length,
      coverageStatus: this.resolveCoverageStatus(
        assignedAssignments.length,
        validSubmittedRevisions.length,
        reviewPeriod.requiredReviewsPerProposal,
      ),
      scoredReviewCount: reviewScores.length,
      weightedAverageScore:
        reviewScores.length === 0
          ? null
          : reviewScores.reduce((sum, score) => sum + score, 0) /
            reviewScores.length,
      recommendationDistribution,
      declaredConflictCount,
      confirmedConflictCount,
      conflictState: this.resolveConflictState(
        declaredConflictCount,
        confirmedConflictCount,
      ),
      decisionStatus:
        existingScorecard?.decisionStatus ?? ProposalDecisionStatus.UNDECIDED,
      createdAt: existingScorecard?.createdAt ?? now,
      updatedAt: now,
    };
  }

  private getLatestRevisionByAssignment(
    revisions: ReviewSubmissionRevision[],
    proposal: Proposal,
    reviewPeriod: ReviewPeriod,
  ) {
    const latestByAssignment = new Map<string, ReviewSubmissionRevision>();

    for (const revision of revisions) {
      if (
        revision.eventId !== proposal.eventId ||
        revision.cfpId !== proposal.cfpId ||
        revision.reviewPeriodId !== reviewPeriod.id ||
        revision.proposalId !== proposal.id
      ) {
        continue;
      }

      const existing = latestByAssignment.get(revision.assignmentId);

      if (!existing || revision.revisionNumber > existing.revisionNumber) {
        latestByAssignment.set(revision.assignmentId, revision);
      }
    }
    return latestByAssignment;
  }

  private getActiveConflictsByReviewer(
    conflicts: ReviewConflict[],
  ): Map<string, ReviewConflict> {
    const activeConflicts = new Map<string, ReviewConflict>();

    for (const conflict of conflicts) {
      if (
        conflict.status !== ConflictStatus.DECLARED &&
        conflict.status !== ConflictStatus.CONFIRMED
      ) {
        continue;
      }

      const existing = activeConflicts.get(conflict.reviewerUserId);

      if (!existing || conflict.status === ConflictStatus.CONFIRMED) {
        activeConflicts.set(conflict.reviewerUserId, conflict);
      }
    }
    return activeConflicts;
  }

  private createRecommendationDistribution(): Record<
    ReviewRecommendation,
    number
  > {
    return {
      [ReviewRecommendation.STRONG_ACCEPT]: 0,
      [ReviewRecommendation.ACCEPT]: 0,
      [ReviewRecommendation.NEUTRAL]: 0,
      [ReviewRecommendation.REJECT]: 0,
      [ReviewRecommendation.STRONG_REJECT]: 0,
    };
  }

  private resolveCoverageStatus(
    assignedReviewCount: number,
    submittedReviewCount: number,
    requiredReviewCount: number,
  ): ReviewCoverageStatus {
    if (assignedReviewCount === 0) {
      return ReviewCoverageStatus.UNASSIGNED;
    }

    if (submittedReviewCount >= requiredReviewCount) {
      return ReviewCoverageStatus.COMPLETE;
    }

    return ReviewCoverageStatus.PARTIAL;
  }

  private calculateWeightedReviewScore(
    revision: ReviewSubmissionRevision,
  ): number | null {
    const scoreByCriterionId = new Map(
      revision.criterionScores.map((criterionScore) => [
        criterionScore.criterionId,
        criterionScore,
      ]),
    );

    let weightedTotal = 0;
    let scoredWeightTotal = 0;

    for (const criterion of revision.rubricSnapshot) {
      const criterionScore = scoreByCriterionId.get(criterion.id);

      if (!criterionScore) {
        /*
         * Missing optional criteria do not count as zero.
         * Missing required criteria invalidate the review score.
         */
        if (criterion.required) {
          return null;
        }

        continue;
      }

      const normalizedScore = this.normalizeCriterionScore(
        criterion,
        criterionScore.score,
      );

      if (normalizedScore === null) {
        return null;
      }

      weightedTotal += normalizedScore * criterion.weight;
      scoredWeightTotal += criterion.weight;
    }

    if (scoredWeightTotal === 0) {
      return null;
    }

    /*
     * Optional unscored criteria are removed from the denominator, rather
     * than silently counted as zero.
     */
    return weightedTotal / scoredWeightTotal;
  }

  private normalizeCriterionScore(
    criterion: ReviewCriterion,
    score: number,
  ): number | null {
    if (
      !Number.isInteger(score) ||
      !Number.isInteger(criterion.minimumScore) ||
      !Number.isInteger(criterion.maximumScore) ||
      criterion.minimumScore >= criterion.maximumScore ||
      score < criterion.minimumScore ||
      score > criterion.maximumScore
    ) {
      return null;
    }

    return (
      ((score - criterion.minimumScore) /
        (criterion.maximumScore - criterion.minimumScore)) *
      100
    );
  }

  private resolveConflictState(
    declaredConflictCount: number,
    confirmedConflictCount: number,
  ): ReviewConflictState {
    if (confirmedConflictCount > 0) return ReviewConflictState.CONFIRMED;

    if (declaredConflictCount > 0) return ReviewConflictState.DECLARED;

    return ReviewConflictState.NONE;
  }
}
