import { Type } from 'class-transformer';
import {
  Max,
  Min,
  IsInt,
  IsEnum,
  IsUUID,
  Matches,
  IsOptional,
} from 'class-validator';

import { ProposalFormat, ProposalStatus } from '@/submissions';

import {
  ReviewConflictState,
  ReviewCoverageStatus,
  ProposalDecisionStatus,
} from '../enums';

export class ChairScorecardQueryDto {
  @IsOptional()
  @IsUUID()
  trackId?: string;

  @IsOptional()
  @IsEnum(ProposalFormat)
  format?: ProposalFormat;

  @IsOptional()
  @IsEnum(ProposalStatus)
  status?: ProposalStatus;

  @IsOptional()
  @IsEnum(ReviewCoverageStatus)
  coverageStatus?: ReviewCoverageStatus;

  @IsOptional()
  @IsEnum(ReviewConflictState)
  conflictState?: ReviewConflictState;

  @IsOptional()
  @IsEnum(ProposalDecisionStatus)
  decisionStatus?: ProposalDecisionStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minimumScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  maximumScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 20;

  @IsOptional()
  @Matches(/^[a-f0-9]{64}$/i, {
    message: 'cursor must be a valid scorecard ID',
  })
  cursor?: string;
}
