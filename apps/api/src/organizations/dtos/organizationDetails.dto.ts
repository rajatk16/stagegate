import { ApiProperty } from '@nestjs/swagger';
import {
  IsUrl,
  IsEnum,
  IsUUID,
  Matches,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

import { OrganizationStatus } from '../enums';

export class OrganizationDetailsDto {
  @ApiProperty()
  @IsUUID()
  id: string;

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

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  websiteUrl?: string | null;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;

  @ApiProperty({
    type: String,
    enum: OrganizationStatus,
  })
  @IsEnum(OrganizationStatus)
  status: OrganizationStatus;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty()
  @IsString()
  createdBy: string;
}
