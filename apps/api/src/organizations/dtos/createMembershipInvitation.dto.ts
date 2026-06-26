import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum } from 'class-validator';

import { OrganizationRole } from '@/authorization/enums';

export class CreateMembershipInvitationDto {
  @ApiProperty()
  @IsEmail()
  email: string;

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
}
