import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsUUID,
  IsArray,
  IsEmail,
  IsString,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';

import { OrganizationRole } from '@/auth';

import { OrganizationMembershipInvitationStatus } from '../enums';

export class OrganizationMembershipInvitationDto {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({
    nullable: true,
  })
  @IsOptional()
  @IsString()
  userId: string | null;

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

  @ApiProperty({
    enum: OrganizationMembershipInvitationStatus,
  })
  @IsEnum(OrganizationMembershipInvitationStatus)
  status: OrganizationMembershipInvitationStatus;

  @ApiProperty()
  @IsString()
  invitedBy: string;

  @ApiProperty()
  @IsDate()
  createdAt: string;

  @ApiProperty()
  @IsDate()
  expiresAt: string;
}
