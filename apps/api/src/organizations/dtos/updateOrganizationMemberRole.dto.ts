import { IsEnum } from 'class-validator';

import { ORGANIZATION_ROLES } from '../enums';

export class UpdateOrganizationMemberRoleDto {
  @IsEnum(ORGANIZATION_ROLES)
  role!: ORGANIZATION_ROLES;
}
