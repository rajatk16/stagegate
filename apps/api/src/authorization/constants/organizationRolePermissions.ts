import { OrganizationPermission, OrganizationRole } from '../enums';

export const ORGANIZATION_ROLE_PERMISSIONS: Record<
  OrganizationRole,
  OrganizationPermission[]
> = {
  [OrganizationRole.OWNER]: [
    OrganizationPermission.MEMBER_READ,
    OrganizationPermission.MEMBER_INVITE,
    OrganizationPermission.MEMBER_REMOVE,
    OrganizationPermission.ORGANIZATION_READ,
    OrganizationPermission.TRANSFER_OWNERSHIP,
    OrganizationPermission.ORGANIZATION_DELETE,
    OrganizationPermission.ORGANIZATION_UPDATE,
    OrganizationPermission.ORGANIZATION_ARCHIVE,
    OrganizationPermission.ORGANIZATION_RESTORE,
  ],
  [OrganizationRole.ADMIN]: [
    OrganizationPermission.MEMBER_INVITE,
    OrganizationPermission.MEMBER_READ,
    OrganizationPermission.ORGANIZATION_READ,
    OrganizationPermission.ORGANIZATION_UPDATE,
  ],
  [OrganizationRole.MEMBER]: [OrganizationPermission.ORGANIZATION_READ],
};
