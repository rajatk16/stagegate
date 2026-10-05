import { ORGANIZATION_ROLES } from '../enums';

export class OrganizationMembershipResponseDto {
  uid!: string;
  role!: ORGANIZATION_ROLES;
}
