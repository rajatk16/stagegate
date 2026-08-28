import { HttpStatus, Injectable } from '@nestjs/common';

import { Event } from '@/events';
import { ApplicationException, ErrorCode } from '@/common';

import { ChairScorecardQueryDto } from '../dtos';
import {
  ReviewPeriodRepository,
  ProposalReviewScorecardRepository,
} from '../repositories';

@Injectable()
export class ChairScorecardApplicationService {
  constructor(
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly proposalReviewScorecardRepository: ProposalReviewScorecardRepository,
  ) {}

  async listScorecards(
    event: Event,
    reviewPeriodId: string,
    query: ChairScorecardQueryDto,
  ) {
    if (
      query.minimumScore !== undefined &&
      query.maximumScore !== undefined &&
      query.minimumScore > query.maximumScore
    ) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'minimumScore cannot be greater than maximumScore',
      );
    }
    const reviewPeriod =
      await this.reviewPeriodRepository.findById(reviewPeriodId);

    if (!reviewPeriod || reviewPeriod.eventId !== event.id) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Review period not found',
      );
    }

    return this.proposalReviewScorecardRepository.findChairScorecardPage(
      reviewPeriod.id,
      query,
    );
  }
}
