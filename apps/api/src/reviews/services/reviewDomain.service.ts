import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApplicationException, ErrorCode } from '@/common';

import {
  SubmitReviewDto,
  UpdateReviewDraftDto,
  ReviewCriterionScoreDto,
} from '../dtos';
import {
  ReviewStatus,
  ReviewPeriodStatus,
  ReviewRecommendation,
} from '../enums';
import {
  Review,
  ReviewPeriod,
  ReviewCriterion,
  ReviewCriterionScore,
} from '../entities';

export type NormalizedReviewDraftUpdate = {
  criterionScores?: ReviewCriterionScore[];
  writtenFeedback?: string | null;
  recommendation?: ReviewRecommendation | null;
};

export type ValidatedReviewSubmission = {
  criterionScores: ReviewCriterionScore[];
  writtenFeedback: string | null;
  recommendation: ReviewRecommendation;
};

@Injectable()
export class ReviewDomainService {
  assertReviewWindowOpen(reviewPeriod: ReviewPeriod, now: Timestamp) {
    if (reviewPeriod.status !== ReviewPeriodStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_NOT_OPEN,
        HttpStatus.CONFLICT,
        'Reviews can only be changed while the review period is open',
      );
    }

    if (
      reviewPeriod.opensAt &&
      reviewPeriod.opensAt.toMillis() > now.toMillis()
    ) {
      throw new ApplicationException(
        ErrorCode.REVIEW_SUBMISSION_NOT_ALLOWED,
        HttpStatus.CONFLICT,
        'The review period has not opened yet',
      );
    }

    if (
      reviewPeriod.closesAt &&
      reviewPeriod.closesAt.toMillis() < now.toMillis()
    ) {
      throw new ApplicationException(
        ErrorCode.REVIEW_SUBMISSION_NOT_ALLOWED,
        HttpStatus.CONFLICT,
        'The review period has closed',
      );
    }
  }

  assertDraft(review: Review) {
    if (review.status !== ReviewStatus.DRAFT) {
      throw new ApplicationException(
        ErrorCode.REVIEW_NOT_DRAFT,
        HttpStatus.CONFLICT,
        'Only a draft review can be changed',
      );
    }
  }

  assertSubmitted(review: Review) {
    if (review.status !== ReviewStatus.SUBMITTED) {
      throw new ApplicationException(
        ErrorCode.REVIEW_NOT_FOUND,
        HttpStatus.CONFLICT,
        'Only a submitted review can be changed',
      );
    }
  }

  assertRevisionAllowed(
    reviewPeriod: ReviewPeriod,
    review: Review,
    now: Timestamp,
  ): void {
    this.assertSubmitted(review);

    if (!reviewPeriod.allowSubmittedReviewRevisions) {
      throw new ApplicationException(
        ErrorCode.REVIEW_REVISION_NOT_ALLOWED,
        HttpStatus.CONFLICT,
        'Submitted review revisions are not enabled for this review period',
      );
    }

    this.assertReviewWindowOpen(reviewPeriod, now);
  }

  normalizeDraftUpdate(
    reviewPeriod: ReviewPeriod,
    dto: UpdateReviewDraftDto,
  ): NormalizedReviewDraftUpdate {
    const update: NormalizedReviewDraftUpdate = {};

    if (dto.criterionScores !== undefined) {
      update.criterionScores = this.normalizeAndValidateScores(
        reviewPeriod.rubricSnapshot,
        dto.criterionScores,
      );
    }

    if (dto.writtenFeedback !== undefined) {
      update.writtenFeedback = this.normalizeText(dto.writtenFeedback);
    }

    if (dto.recommendation !== undefined) {
      update.recommendation = dto.recommendation;
    }

    return update;
  }

  validateSubmission(
    reviewPeriod: ReviewPeriod,
    dto: SubmitReviewDto,
  ): ValidatedReviewSubmission {
    this.assertValidRubricSnapshot(reviewPeriod.rubricSnapshot);

    const criterionScores = this.normalizeAndValidateScores(
      reviewPeriod.rubricSnapshot,
      dto.criterionScores,
    );

    const submittedCriterionIds = new Set(
      criterionScores.map((criterionScore) => criterionScore.criterionId),
    );

    for (const criterion of reviewPeriod.rubricSnapshot) {
      if (criterion.required && !submittedCriterionIds.has(criterion.id)) {
        throw new ApplicationException(
          ErrorCode.REVIEW_REQUIRED_CRITERION_MISSING,
          HttpStatus.UNPROCESSABLE_ENTITY,
          `A score is required for "${criterion.label}"`,
        );
      }
    }

    if (!Object.values(ReviewRecommendation).includes(dto.recommendation)) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'A valid review recommendation is required',
      );
    }

    return {
      criterionScores,
      writtenFeedback: this.normalizeText(dto.writtenFeedback),
      recommendation: dto.recommendation,
    };
  }

  private normalizeAndValidateScores(
    rubricSnapshot: ReviewCriterion[],
    inputScores: ReviewCriterionScoreDto[],
  ): ReviewCriterionScore[] {
    this.assertValidRubricSnapshot(rubricSnapshot);

    const criterionById = new Map(
      rubricSnapshot.map((criterion) => [criterion.id, criterion]),
    );

    const seenCriterionIds = new Set<string>();
    const normalizedScores: ReviewCriterionScore[] = [];

    for (const inputScore of inputScores) {
      const criterion = criterionById.get(inputScore.criterionId);

      if (!criterion) {
        throw new ApplicationException(
          ErrorCode.REVIEW_INVALID_CRITERION,
          HttpStatus.UNPROCESSABLE_ENTITY,
          'The review contains a criterion not present in this review period',
        );
      }

      if (seenCriterionIds.has(inputScore.criterionId)) {
        throw new ApplicationException(
          ErrorCode.REVIEW_DUPLICATE_CRITERION_SCORE,
          HttpStatus.UNPROCESSABLE_ENTITY,
          'Each review criterion can be scored only once',
        );
      }

      if (
        !Number.isInteger(inputScore.score) ||
        inputScore.score < criterion.minimumScore ||
        inputScore.score > criterion.maximumScore
      ) {
        throw new ApplicationException(
          ErrorCode.REVIEW_SCORE_OUT_OF_RANGE,
          HttpStatus.UNPROCESSABLE_ENTITY,
          `Score for "${criterion.label}" must be between ` +
            `${criterion.minimumScore} and ${criterion.maximumScore}`,
        );
      }

      seenCriterionIds.add(inputScore.criterionId);

      normalizedScores.push({
        criterionId: criterion.id,
        score: inputScore.score,
        feedback: this.normalizeText(inputScore.feedback),
      });
    }

    return normalizedScores.sort((left, right) => {
      const leftOrder = criterionById.get(left.criterionId)!.displayOrder;
      const rightOrder = criterionById.get(right.criterionId)!.displayOrder;

      return leftOrder - rightOrder;
    });
  }

  private assertValidRubricSnapshot(rubricSnapshot: ReviewCriterion[]): void {
    if (rubricSnapshot.length === 0) {
      throw new ApplicationException(
        ErrorCode.REVIEW_SUBMISSION_NOT_ALLOWED,
        HttpStatus.CONFLICT,
        'The review period does not have a valid rubric snapshot',
      );
    }

    const criterionIds = new Set<string>();

    for (const criterion of rubricSnapshot) {
      if (
        !criterion.id ||
        criterionIds.has(criterion.id) ||
        !Number.isInteger(criterion.minimumScore) ||
        !Number.isInteger(criterion.maximumScore) ||
        criterion.minimumScore >= criterion.maximumScore
      ) {
        throw new ApplicationException(
          ErrorCode.REVIEW_SUBMISSION_NOT_ALLOWED,
          HttpStatus.CONFLICT,
          'The review period does not have a valid rubric snapshot',
        );
      }

      criterionIds.add(criterion.id);
    }
  }

  private normalizeText(value: string | null | undefined): string | null {
    const normalized = value?.trim();

    return normalized ? normalized : null;
  }
}
