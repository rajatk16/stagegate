import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsUUID } from 'class-validator';

import { OrganizationRole } from '@/auth';

import { MembershipStatus } from '../enums';

export class OrganizationMembershipResponseDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({
    type: [String],
    enum: OrganizationRole,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(OrganizationRole, {
    each: true,
  })
  roles: OrganizationRole[];

  @ApiProperty({
    enum: MembershipStatus,
  })
  @IsEnum(MembershipStatus)
  status: MembershipStatus;
}
