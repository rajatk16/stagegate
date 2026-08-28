import { toIso } from '@/common';
import { Proposal } from '@/submissions';

import { ReviewMapper } from './review.mapper';
import { ProposalReviewScorecard } from '../entities';
import { ChairProposalViewResponseDto } from '../dtos';

export class ChairProposalViewMapper {
  static toDto(
    proposal: Proposal,
    scorecard: ProposalReviewScorecard | null,
  ): ChairProposalViewResponseDto {
    return {
      proposalId: proposal.id,
      status: proposal.status,

      title: proposal.title,
      abstract: proposal.abstract,
      description: proposal.description,
      format: proposal.format,
      durationMinutes: proposal.durationMinutes,
      language: proposal.language,
      trackId: proposal.trackId,

      primarySpeaker: proposal.primarySpeakerSnapshot
        ? {
            displayName: proposal.primarySpeakerSnapshot.displayName,
            biography: proposal.primarySpeakerSnapshot.biography,
            organization: proposal.primarySpeakerSnapshot.organization,
            jobTitle: proposal.primarySpeakerSnapshot.jobTitle,
            location: proposal.primarySpeakerSnapshot.location,
            websiteUrl: proposal.primarySpeakerSnapshot.websiteUrl,
            pronouns: proposal.primarySpeakerSnapshot.pronouns,
          }
        : null,
      consent: proposal.consent
        ? {
            version: proposal.consent.version,
            acceptedAt: toIso(proposal.consent.acceptedAt)!,
          }
        : null,
      scorecard: scorecard ? ReviewMapper.toChairScorecardDto(scorecard) : null,
      submittedAt: toIso(proposal.submittedAt),
      withdrawnAt: toIso(proposal.withdrawnAt),
      updatedAt: toIso(proposal.updatedAt)!,
    };
  }
}
