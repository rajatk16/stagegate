import { OrganizationPermission, OrganizationRole } from '../enums';

export const ORGANIZATION_ROLE_PERMISSIONS: Record<
  OrganizationRole,
  OrganizationPermission[]
> = {
  [OrganizationRole.OWNER]: [
    OrganizationPermission.MEMBER_READ,
    OrganizationPermission.MEMBER_INVITE,
    OrganizationPermission.MEMBER_REMOVE,
    OrganizationPermission.MEMBER_UPDATE,
    OrganizationPermission.ORGANIZATION_READ,
    OrganizationPermission.ORGANIZATION_UPDATE,
    OrganizationPermission.ORGANIZATION_ARCHIVE,
    OrganizationPermission.ORGANIZATION_RESTORE,
    OrganizationPermission.ORGANIZATION_TRANSFER_OWNERSHIP,
  ],
  [OrganizationRole.ADMIN]: [
    OrganizationPermission.MEMBER_READ,
    OrganizationPermission.MEMBER_INVITE,
    OrganizationPermission.MEMBER_REMOVE,
    OrganizationPermission.MEMBER_UPDATE,
    OrganizationPermission.ORGANIZATION_READ,
    OrganizationPermission.ORGANIZATION_UPDATE,
  ],
  [OrganizationRole.MEMBER]: [OrganizationPermission.ORGANIZATION_READ],
};
