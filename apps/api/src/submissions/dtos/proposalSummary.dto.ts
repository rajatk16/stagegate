import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';

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
}
