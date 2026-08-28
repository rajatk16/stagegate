import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ProposalFormat, ProposalStatus } from '@/submissions';

import { ChairScorecardResponseDto } from './chairScorecardResponse.dto';

export class ChairProposalSpeakerDto {
  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  biography: string | null;

  @ApiPropertyOptional()
  organization: string | null;

  @ApiPropertyOptional()
  jobTitle: string | null;

  @ApiPropertyOptional()
  location: string | null;

  @ApiPropertyOptional()
  websiteUrl: string | null;

  @ApiPropertyOptional()
  pronouns: string | null;
}

export class ChairProposalConsentDto {
  @ApiProperty()
  version: string;

  @ApiProperty()
  acceptedAt: string;
}

export class ChairProposalViewResponseDto {
  @ApiProperty()
  proposalId: string;

  @ApiProperty({ enum: ProposalStatus })
  status: ProposalStatus;

  @ApiProperty()
  title: string;

  @ApiProperty()
  abstract: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: ProposalFormat })
  format: ProposalFormat;

  @ApiPropertyOptional()
  durationMinutes: number | null;

  @ApiProperty()
  language: string;

  @ApiProperty()
  trackId: string | null;

  @ApiPropertyOptional({ type: ChairProposalSpeakerDto })
  primarySpeaker: ChairProposalSpeakerDto | null;

  @ApiPropertyOptional({ type: ChairProposalConsentDto })
  consent: ChairProposalConsentDto | null;

  @ApiPropertyOptional({ type: ChairScorecardResponseDto })
  scorecard: ChairScorecardResponseDto | null;

  @ApiPropertyOptional()
  submittedAt: string | null;

  @ApiPropertyOptional()
  withdrawnAt: string | null;

  @ApiProperty()
  updatedAt: string;
}
