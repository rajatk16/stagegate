import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator';

import { ProposalFormat, ProposalStatus } from '../enums';

export class ProposalDetailsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEnum(ProposalStatus)
  status: ProposalStatus;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  abstract: string;

  @ApiPropertyOptional()
  @IsString()
  description: string | null;

  @ApiProperty()
  @IsEnum(ProposalFormat)
  format: ProposalFormat;

  @ApiPropertyOptional()
  @IsNumber()
  durationMinutes: number | null;

  @ApiProperty()
  @IsString()
  language: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional()
  submittedAt: string | null;

  @ApiPropertyOptional()
  withdrawnAt: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  consent: {
    version: string;
    acceptedAt: string;
  } | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  trackId: string | null;
}
