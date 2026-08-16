import { toIso } from '@/common';

import { Proposal } from '../entities';
import { ProposalDetailsDto, ProposalSummaryDto } from '../dtos';

export class ProposalMapper {
  static toDetailsDto(proposal: Proposal): ProposalDetailsDto {
    return {
      id: proposal.id,
      status: proposal.status,
      title: proposal.title,
      abstract: proposal.abstract,
      description: proposal.description,
      format: proposal.format,
      durationMinutes: proposal.durationMinutes,
      language: proposal.language,
      createdAt: toIso(proposal.createdAt)!,
      updatedAt: toIso(proposal.updatedAt)!,
      submittedAt: toIso(proposal.submittedAt),
      withdrawnAt: toIso(proposal.withdrawnAt),
      consent: proposal.consent
        ? {
            version: proposal.consent.version,
            acceptedAt: toIso(proposal.consent.acceptedAt)!,
          }
        : null,
    };
  }
  static toSummaryDto(proposal: Proposal): ProposalSummaryDto {
    return {
      id: proposal.id,
      title: proposal.title,
      abstract: proposal.abstract,
      status: proposal.status,
      durationMinutes: proposal.durationMinutes,
      format: proposal.format,
      language: proposal.language,
    };
  }
}
