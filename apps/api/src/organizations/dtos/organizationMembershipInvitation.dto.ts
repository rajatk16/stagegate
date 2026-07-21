import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { OrganizationMembershipInvitationStatus } from '../enums';

export class OrganizationMembershipInvitationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({
    nullable: true,
  })
  userId: string | null;

  @ApiProperty({
    enum: OrganizationRole,
    isArray: true,
  })
  roles: OrganizationRole[];

  @ApiProperty({
    enum: OrganizationMembershipInvitationStatus,
  })
  status: OrganizationMembershipInvitationStatus;

  @ApiProperty()
  invitedBy: string;

  @ApiProperty()
  createdAt: Timestamp;

  @ApiProperty()
  expiresAt: Timestamp;
}
