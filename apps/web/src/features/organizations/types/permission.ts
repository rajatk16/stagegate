export enum OrganizationRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export const canEditOrganization = (roles: OrganizationRole[]) =>
  roles.includes(OrganizationRole.OWNER) ||
  roles.includes(OrganizationRole.ADMIN);

export const canArchiveOrganization = (roles: OrganizationRole[]) =>
  roles.includes(OrganizationRole.OWNER);

export const canManageMembers = (roles: OrganizationRole[]) =>
  roles.includes(OrganizationRole.OWNER) ||
  roles.includes(OrganizationRole.ADMIN);

export const canTransferOwnership = (roles: OrganizationRole[]) =>
  roles.includes(OrganizationRole.OWNER);
