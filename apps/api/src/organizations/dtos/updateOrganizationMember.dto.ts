import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';

import { OrganizationRole } from '@/auth';

export class UpdateOrganizationMemberDto {
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
