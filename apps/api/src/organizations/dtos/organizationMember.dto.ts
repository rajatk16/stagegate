import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';

export class OrganizationMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    nullable: true,
  })
  avatarUrl?: string | null;

  @ApiProperty({
    enum: MembershipStatus,
  })
  status: MembershipStatus;

  @ApiProperty({
    enum: OrganizationRole,
    isArray: true,
  })
  roles: OrganizationRole[];

  @ApiProperty()
  joinedAt: Timestamp;
}
