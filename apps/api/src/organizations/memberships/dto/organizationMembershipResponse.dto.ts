import { ApiProperty } from '@nestjs/swagger';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';

export class OrganizationMembershipResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({
    type: [String],
    enum: OrganizationRole,
  })
  roles: OrganizationRole[];

  @ApiProperty({
    enum: MembershipStatus,
  })
  status: MembershipStatus;
}
