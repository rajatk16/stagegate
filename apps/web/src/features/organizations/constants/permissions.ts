import { OrganizationRole } from '../types';

export const ORGANIZATION_ROLE_HIERARCHY = {
  [OrganizationRole.OWNER]: 3,
  [OrganizationRole.ADMIN]: 2,
  [OrganizationRole.MEMBER]: 1,
} as const;

export const ORGANIZATION_PERMISSIONS = {
  VIEW_ORGANIZATION: [
    OrganizationRole.OWNER,
    OrganizationRole.ADMIN,
    OrganizationRole.MEMBER,
  ],

  UPDATE_ORGANIZATION: [OrganizationRole.OWNER, OrganizationRole.ADMIN],

  MANAGE_MEMBERS: [OrganizationRole.OWNER, OrganizationRole.ADMIN],

  INVITE_MEMBERS: [OrganizationRole.OWNER, OrganizationRole.ADMIN],

  REMOVE_MEMBERS: [OrganizationRole.OWNER, OrganizationRole.ADMIN],

  TRANSFER_OWNERSHIP: [OrganizationRole.OWNER],

  ARCHIVE_ORGANIZATION: [OrganizationRole.OWNER],

  RESTORE_ORGANIZATION: [OrganizationRole.OWNER],
};
