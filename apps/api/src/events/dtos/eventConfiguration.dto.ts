import { Transform, TransformFnParams } from 'class-transformer';
import {
  Max,
  Min,
  IsInt,
  IsEnum,
  IsUUID,
  Length,
  IsString,
  IsBoolean,
  MaxLength,
  IsOptional,
  ValidateIf,
} from 'class-validator';

import { EVENT_CONFIGURATION_KIND } from '../enums/eventConfigurationKind.enum';

const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

const nullableText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() || null : value;

class ConfigurationFieldsDto {
  @Transform(nullableText)
  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_440)
  durationMinutes?: number | null;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsBoolean()
  isActive?: boolean;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  @Max(Number.MAX_SAFE_INTEGER)
  sortOrder?: number;
}

export class CreateEventConfigurationDto extends ConfigurationFieldsDto {
  @IsEnum(EVENT_CONFIGURATION_KIND)
  kind!: EVENT_CONFIGURATION_KIND;

  @Transform(trim)
  @IsString()
  @Length(1, 120)
  name!: string;
}

export class UpdateEventConfigurationDto extends ConfigurationFieldsDto {
  @Transform(trim)
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsString()
  @Length(1, 120)
  name?: string;
}

export class ListEventConfigurationDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' && /^[1-9]\d{0,2}$/.test(value)
      ? Number(value)
      : value,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 50;

  @IsOptional()
  @IsUUID('4')
  cursor?: string;
}
