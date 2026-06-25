import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationStatus } from '../enums';

export class OrganizationDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    nullable: true,
  })
  websiteUrl?: string | null;

  @ApiProperty({
    nullable: true,
  })
  logoUrl?: string | null;

  @ApiProperty({
    type: String,
    enum: OrganizationStatus,
  })
  status: string;

  @ApiProperty()
  createdAt: Timestamp;

  @ApiProperty()
  updatedAt: Timestamp;

  @ApiProperty()
  createdBy: string;
}
