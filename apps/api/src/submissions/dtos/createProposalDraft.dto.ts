import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ProposalFormat } from '../enums';

export class CreateProposalDraftDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(3_000)
  abstract: string;

  @IsOptional()
  @IsString()
  @MaxLength(20_000)
  description?: string | null;

  @IsEnum(ProposalFormat)
  format: ProposalFormat;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(480)
  durationMinutes?: number | null;

  @IsString()
  @Length(2, 16)
  language: string;
}
