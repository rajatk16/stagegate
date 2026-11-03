import { ORGANIZATION_ROLES } from '../enums/organizationRoles.enum';

export class OrganizationMembershipResponseDto {
  uid!: string;
  role!: ORGANIZATION_ROLES;
}
