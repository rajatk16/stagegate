import { Transform, TransformFnParams } from 'class-transformer';
import {
  Max,
  Min,
  IsInt,
  IsEnum,
  Length,
  IsString,
  MaxLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

import { EVENT_FORMAT } from '../enums/eventFormat.enum';
import { IsInstant } from '../../common/validators/isInstant.validator';

const trimText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

const nullableText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() || null : value;

export class UpdateEventDto {
  @Transform(trimText)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsString()
  @Length(2, 120)
  name?: string;

  @Transform(nullableText)
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  description?: string | null;

  @IsOptional()
  @IsEnum(EVENT_FORMAT)
  format?: EVENT_FORMAT | null;

  @Transform(nullableText)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string | null;

  @IsOptional()
  @IsInstant()
  startsAt?: string | null;

  @IsOptional()
  @IsInstant()
  endsAt?: string | null;

  @IsOptional()
  @IsInstant()
  submissionOpensAt?: string | null;

  @IsOptional()
  @IsInstant()
  submissionClosesAt?: string | null;

  @Transform(trimText)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsString()
  @Length(1, 100)
  timezone?: string;

  @Transform(nullableText)
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  submissionInstructions?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(Number.MAX_SAFE_INTEGER)
  maxSubmissionsPerPerson?: number | null;
}
