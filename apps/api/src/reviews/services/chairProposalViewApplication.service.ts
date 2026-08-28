import { HttpStatus, Injectable } from '@nestjs/common';

import { Proposal, ProposalRepository, ProposalStatus } from '@/submissions';

import { ProposalReviewScorecard } from '../entities';
import {
  ProposalReviewScorecardRepository,
  ReviewPeriodRepository,
} from '../repositories';
import { Event } from '@/events';
import { ApplicationException, ErrorCode } from '@/common';

export type ChairProposalView = {
  proposal: Proposal;
  scorecard: ProposalReviewScorecard | null;
};

@Injectable()
export class ChairProposalViewApplicationService {
  constructor(
    private readonly proposalRepository: ProposalRepository,
    private readonly reviewPeriodRepository: ReviewPeriodRepository,
    private readonly proposalReviewScorecardRepository: ProposalReviewScorecardRepository,
  ) {}

  async getProposalView(
    event: Event,
    reviewPeriodId: string,
    proposalId: string,
  ): Promise<ChairProposalView> {
    const [reviewPeriod, proposal] = await Promise.all([
      this.reviewPeriodRepository.findById(reviewPeriodId),
      this.proposalRepository.findById(proposalId),
    ]);

    if (!reviewPeriod || reviewPeriod.eventId !== event.id) {
      throw new ApplicationException(
        ErrorCode.REVIEW_PERIOD_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Review period not found',
      );
    }

    if (
      !proposal ||
      proposal.eventId !== event.id ||
      proposal.cfpId !== reviewPeriod.cfpId ||
      (proposal.status !== ProposalStatus.SUBMITTED &&
        proposal.status !== ProposalStatus.WITHDRAWN)
    ) {
      throw new ApplicationException(
        ErrorCode.PROPOSAL_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Proposal not found',
      );
    }

    const scorecard =
      await this.proposalReviewScorecardRepository.findByReviewPeriodAndProposal(
        reviewPeriod.id,
        proposal.id,
      );

    return {
      proposal,
      scorecard,
    };
  }
}
