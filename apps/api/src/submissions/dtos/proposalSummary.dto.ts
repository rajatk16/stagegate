import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';

import { ProposalFormat, ProposalStatus } from '../enums';

export class ProposalSummaryDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  abstract: string;

  @ApiProperty()
  @IsString()
  status: ProposalStatus;

  @ApiPropertyOptional()
  @IsNumber()
  durationMinutes: number | null;

  @ApiProperty()
  @IsEnum(ProposalFormat)
  format: ProposalFormat;

  @ApiProperty()
  @IsString()
  language: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  trackId: string | null;
}
