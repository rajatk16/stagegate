import { ApiProperty } from '@nestjs/swagger';
import { Timestamp } from 'firebase-admin/firestore';
import {
  IsUrl,
  IsEnum,
  IsUUID,
  IsArray,
  IsEmail,
  IsString,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';

export class OrganizationMemberDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsString()
  displayName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;

  @ApiProperty({
    enum: MembershipStatus,
  })
  @IsEnum(MembershipStatus)
  status: MembershipStatus;

  @ApiProperty({
    enum: OrganizationRole,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(OrganizationRole, {
    each: true,
  })
  roles: OrganizationRole[];

  @ApiProperty()
  joinedAt: Timestamp;

  @ApiProperty({
    nullable: true,
  })
  removedAt?: Timestamp | null;
}
