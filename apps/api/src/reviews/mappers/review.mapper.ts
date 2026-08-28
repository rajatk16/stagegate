import { toIso } from '@/common';

import {
  ReviewPeriodResponseDto,
  ReviewRubricResponseDto,
  ChairScorecardResponseDto,
  ReviewConflictResponseDto,
  ReviewCriterionResponseDto,
  ReviewAssignmentResponseDto,
  ReviewerEligibilityResponseDto,
} from '../dtos';
import {
  ReviewRubric,
  ReviewPeriod,
  ReviewConflict,
  ReviewCriterion,
  ReviewAssignment,
  ReviewerEligibility,
  ProposalReviewScorecard,
} from '../entities';

export class ReviewMapper {
  static toCriterionDto(
    criterion: ReviewCriterion,
  ): ReviewCriterionResponseDto {
    return {
      id: criterion.id,
      label: criterion.label,
      description: criterion.description,
      weight: criterion.weight,
      minimumScore: criterion.minimumScore,
      maximumScore: criterion.maximumScore,
      displayOrder: criterion.displayOrder,
      required: criterion.required,
    };
  }

  static toRubricDto(rubric: ReviewRubric): ReviewRubricResponseDto {
    return {
      id: rubric.id,
      eventId: rubric.eventId,
      cfpId: rubric.cfpId,
      version: rubric.version,
      criteria: rubric.criteria.map((criterion) =>
        this.toCriterionDto(criterion),
      ),
      createdAt: toIso(rubric.createdAt)!,
      updatedAt: toIso(rubric.updatedAt)!,
    };
  }

  static toPeriodDto(period: ReviewPeriod): ReviewPeriodResponseDto {
    return {
      id: period.id,
      eventId: period.eventId,
      cfpId: period.cfpId,
      name: period.name,
      status: period.status,
      opensAt: toIso(period.opensAt),
      closesAt: toIso(period.closesAt),
      rubricVersion: period.rubricVersion,
      rubricSnapshot: period.rubricSnapshot.map((criterion) =>
        this.toCriterionDto(criterion),
      ),
      createdAt: toIso(period.createdAt)!,
      updatedAt: toIso(period.updatedAt)!,
      openedAt: toIso(period.openedAt),
      closedAt: toIso(period.closedAt),
    };
  }

  static toEligibilityDto(
    eligibility: ReviewerEligibility,
  ): ReviewerEligibilityResponseDto {
    return {
      id: eligibility.id,
      eventId: eligibility.eventId,
      userId: eligibility.userId,
      status: eligibility.status,
      reason: eligibility.reason,
      updatedAt: toIso(eligibility.updatedAt)!,
    };
  }

  static toConflictDto(conflict: ReviewConflict): ReviewConflictResponseDto {
    return {
      id: conflict.id,
      proposalId: conflict.proposalId,
      reviewerUserId: conflict.reviewerUserId,
      status: conflict.status,
      reason: conflict.reason,
      declaredAt: toIso(conflict.declaredAt)!,
      resolvedAt: toIso(conflict.resolvedAt),
      resolutionNote: conflict.resolutionNote,
      updatedAt: toIso(conflict.updatedAt)!,
    };
  }

  static toAssignmentDto(
    assignment: ReviewAssignment,
  ): ReviewAssignmentResponseDto {
    return {
      id: assignment.id,
      eventId: assignment.eventId,
      cfpId: assignment.cfpId,
      reviewPeriodId: assignment.reviewPeriodId,
      proposalId: assignment.proposalId,
      reviewerUserId: assignment.reviewerUserId,
      status: assignment.status,
      dueAt: toIso(assignment.dueAt),
      assignedBy: assignment.assignedBy,
      assignedAt: toIso(assignment.assignedAt)!,
      revokedAt: toIso(assignment.revokedAt),
      revokedBy: assignment.revokedBy,
      revokeReason: assignment.revokeReason,
    };
  }

  static toChairScorecardDto(
    scorecard: ProposalReviewScorecard,
  ): ChairScorecardResponseDto {
    return {
      proposalId: scorecard.proposalId,
      proposalTitle: scorecard.proposalTitle,
      trackId: scorecard.trackId,
      proposalFormat: scorecard.proposalFormat,
      proposalStatus: scorecard.proposalStatus,

      requiredReviewCount: scorecard.requiredReviewCount,
      assignedReviewCount: scorecard.assignedReviewCount,
      inProgressReviewCount: scorecard.inProgressReviewCount,
      submittedReviewCount: scorecard.submittedReviewCount,
      overdueAssignmentCount: scorecard.overdueAssignmentCount,
      coverageStatus: scorecard.coverageStatus,

      scoredReviewCount: scorecard.scoredReviewCount,
      weightedAverageScore:
        scorecard.weightedAverageScore === null
          ? null
          : Number(scorecard.weightedAverageScore.toFixed(2)),

      recommendationDistribution: scorecard.recommendationDistribution,

      declaredConflictCount: scorecard.declaredConflictCount,
      confirmedConflictCount: scorecard.confirmedConflictCount,
      conflictState: scorecard.conflictState,

      decisionStatus: scorecard.decisionStatus,
      updatedAt: toIso(scorecard.updatedAt)!,
    };
  }
}
