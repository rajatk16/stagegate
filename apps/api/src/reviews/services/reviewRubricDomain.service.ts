import { HttpStatus, Injectable } from '@nestjs/common';

import { ApplicationException, ErrorCode } from '@/common';

import { ReviewCriterion } from '../entities';

@Injectable()
export class ReviewRubricDomainService {
  assertValidCriteria(criteria: ReviewCriterion[]) {
    if (criteria.length === 0) {
      throw new ApplicationException(
        ErrorCode.REVIEW_RUBRIC_INVALID,
        HttpStatus.BAD_REQUEST,
        'A review rubric must contain at least one criterion.',
      );
    }

    if (criteria.length > 20) {
      throw new ApplicationException(
        ErrorCode.REVIEW_RUBRIC_INVALID,
        HttpStatus.BAD_REQUEST,
        'A review rubric cannot contain more than 20 criteria.',
      );
    }

    const normalizedLabels = new Set<string>();
    const displayOrders = new Set<number>();

    for (const criterion of criteria) {
      const label = criterion.label.trim().toLocaleLowerCase();

      if (!label) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Each review criterion must have a label.',
        );
      }

      if (normalizedLabels.has(label)) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Review criterion labels must be unique.',
        );
      }

      normalizedLabels.add(label);

      if (!Number.isInteger(criterion.weight) || criterion.weight < 1) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Each review criterion must have a positive integer weight.',
        );
      }

      if (
        !Number.isInteger(criterion.minimumScore) ||
        !Number.isInteger(criterion.maximumScore) ||
        criterion.minimumScore >= criterion.maximumScore
      ) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Each review criterion must have a valid score range.',
        );
      }

      if (
        !Number.isInteger(criterion.displayOrder) ||
        criterion.displayOrder < 1
      ) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Each review criterion must have a valid display order',
        );
      }

      if (displayOrders.has(criterion.displayOrder)) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Review criterion display orders must be unique',
        );
      }

      displayOrders.add(criterion.displayOrder);
    }

    const totalWeight = criteria.reduce(
      (sum, criterion) => sum + criterion.weight,
      0,
    );

    if (totalWeight !== 100) {
      throw new ApplicationException(
        ErrorCode.REVIEW_RUBRIC_INVALID,
        HttpStatus.BAD_REQUEST,
        'Review criterion weights must total exactly 100',
      );
    }

    const expectedOrders = Array.from(
      { length: criteria.length },
      (_, index) => index + 1,
    );

    for (const expectedOrder of expectedOrders) {
      if (!displayOrders.has(expectedOrder)) {
        throw new ApplicationException(
          ErrorCode.REVIEW_RUBRIC_INVALID,
          HttpStatus.BAD_REQUEST,
          'Review criterion display orders must be contiguous',
        );
      }
    }
  }
}
