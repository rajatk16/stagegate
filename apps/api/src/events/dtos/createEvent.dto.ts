import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Matches,
  IsString,
  IsISO8601,
  MaxLength,
  MinLength,
  IsOptional,
  IsTimeZone,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'Google Developer Group New York',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    description:
      'The slug of the event. If not provided, it will be generated from the name.',
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

  @ApiProperty({
    example: 'America/New_York',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @IsTimeZone()
  timezone: string;

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
