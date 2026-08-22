import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ApplicationException, ErrorCode } from '@/common';

import { ReviewPeriodStatus } from '../enums';
import { ReviewCriterion, ReviewPeriod, ReviewRubric } from '../entities';

@Injectable()
export class ReviewPeriodDomainService {
  assertValidSchedule(opensAt: Timestamp | null, closesAt: Timestamp | null) {
    if (opensAt && closesAt && opensAt.toMillis() >= closesAt.toMillis()) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
        HttpStatus.BAD_REQUEST,
        'The review closing time must be after its opening time',
      );
    }
  }

  assertDraft(period: ReviewPeriod) {
    if (period.status !== ReviewPeriodStatus.DRAFT) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
        HttpStatus.BAD_REQUEST,
        'Only a draft review period can be changed',
      );
    }
  }

  open(period: ReviewPeriod, rubric: ReviewRubric, now: Timestamp) {
    this.assertDraft(period);

    if (period.opensAt && period.opensAt.toMillis() > now.toMillis()) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'The configured review opening time has not been reached',
      );
    }

    if (period.closesAt && period.closesAt.toMillis() <= now.toMillis()) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'The configured review closing time has already passed',
      );
    }

    period.status = ReviewPeriodStatus.OPEN;
    period.rubricVersion = rubric.version;

    period.rubricSnapshot = rubric.criteria.map(
      (criterion: ReviewCriterion) => ({
        id: criterion.id,
        label: criterion.label,
        description: criterion.description,
        weight: criterion.weight,
        minimumScore: criterion.minimumScore,
        maximumScore: criterion.maximumScore,
        displayOrder: criterion.displayOrder,
        required: criterion.required,
      }),
    );

    period.openedAt = now;
    period.updatedAt = now;
  }

  close(period: ReviewPeriod, now: Timestamp) {
    if (period.status !== ReviewPeriodStatus.OPEN) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'Only an open review period can be closed',
      );
    }

    period.status = ReviewPeriodStatus.CLOSED;
    period.closedAt = now;
    period.updatedAt = now;
  }

  lock(period: ReviewPeriod, now: Timestamp) {
    if (period.status !== ReviewPeriodStatus.CLOSED) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_INVALID_STATE_TRANSITION,
        HttpStatus.CONFLICT,
        'Only a closed review period can be locked',
      );
    }

    period.status = ReviewPeriodStatus.LOCKED;
    period.updatedAt = now;
  }
}
