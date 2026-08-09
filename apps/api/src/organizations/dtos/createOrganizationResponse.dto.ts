import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsUUID,
  Matches,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { OrganizationStatus } from '../enums';

export class CreateOrganizationResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
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
  @IsEnum(OrganizationStatus)
  status: OrganizationStatus;
}
