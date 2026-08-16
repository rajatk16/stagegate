import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  Matches,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsTimeZone,
} from 'class-validator';

import { EventStatus } from '../enums';

export class EventDetailsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens.',
  })
  slug: string;

  @ApiProperty()
  @IsUUID()
  publicId: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty()
  @IsString()
  @IsTimeZone()
  timezone: string;

  @ApiPropertyOptional()
  @IsOptional()
  startsAt?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  endsAt?: string | null;

  @ApiProperty()
  @IsEnum(EventStatus)
  status: EventStatus;

  @ApiPropertyOptional()
  @IsOptional()
  publishedAt: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  archivedAt: string | null;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
