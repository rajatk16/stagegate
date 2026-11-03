import { ORGANIZATION_ROLES } from '../../organizations/enums/organizationRoles.enum';
import { OrganizationMembership } from '../../organizations/models/organizationMembership.model';

export const isOrganizationAdministrator = (
  membership: Pick<OrganizationMembership, 'role'>,
): boolean =>
  membership.role === ORGANIZATION_ROLES.OWNER ||
  membership.role === ORGANIZATION_ROLES.ADMIN;
