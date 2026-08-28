import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

import { ProposalDecisionStatus } from '../enums';

export class UpdateProposalDecisionDto {
  @IsEnum(ProposalDecisionStatus)
  status: ProposalDecisionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  speakerMessage?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  internalRationale?: string | null;
}
