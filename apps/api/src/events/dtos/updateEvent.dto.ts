import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  Matches,
  IsString,
  IsISO8601,
  MaxLength,
  MinLength,
  IsOptional,
  IsTimeZone,
} from 'class-validator';

export class UpdateEventDto {
  @ApiPropertyOptional({
    example: 'Google Developer Group New York',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: 'google-developer-group-new-york',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens.',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsTimeZone()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  startsAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  endsAt?: string | null;
}
