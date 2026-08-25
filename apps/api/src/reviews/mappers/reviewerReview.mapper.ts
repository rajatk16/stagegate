import { toIso } from '@/common';

import { Review, ReviewCriterion } from '../entities';
import { ReviewerReviewWorkspace } from '../services';
import {
  ReviewerReviewResponseDto,
  ReviewerReviewWorkspaceResponseDto,
} from '../dtos';

export class ReviewerReviewMapper {
  static toReviewDto(review: Review): ReviewerReviewResponseDto {
    return {
      status: review.status,
      criterionScores: review.criterionScores.map((criterionScore) => ({
        criterionId: criterionScore.criterionId,
        score: criterionScore.score,
        feedback: criterionScore.feedback,
      })),
      writtenFeedback: review.writtenFeedback,
      recommendation: review.recommendation,
      currentRevisionNumber: review.currentRevisionNumber,
      submittedAt: toIso(review.submittedAt),
    };
  }

  static toWorkspaceDto(
    workspace: ReviewerReviewWorkspace,
  ): ReviewerReviewWorkspaceResponseDto {
    return {
      rubric: workspace.rubricSnapshot
        .map((criterion) => this.toCriterionDto(criterion))
        .sort((left, right) => left.displayOrder - right.displayOrder),
      review: workspace.review ? this.toReviewDto(workspace.review) : null,
    };
  }

  private static toCriterionDto(criterion: ReviewCriterion) {
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
}
