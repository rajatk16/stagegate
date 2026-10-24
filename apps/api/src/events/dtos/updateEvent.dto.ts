import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  Length,
  Matches,
  IsString,
  IsISO8601,
  MaxLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

import { EVENT_FORMAT } from '../enums';

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
  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  startsAt?: string | null;

  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  @Matches(/T.*(?:Z|[+-]\d{2}:\d{2})$/)
  endsAt?: string | null;

  @Transform(trimText)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsString()
  @Length(1, 100)
  timezone?: string;
}
