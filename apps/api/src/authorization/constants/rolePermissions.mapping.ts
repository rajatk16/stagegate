import { Permission, Role } from '../enums';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),
  [Role.ORGANIZATION_OWNER]: [
    Permission.ORGANIZATION_MANAGE,
    Permission.ORGANIZATION_READ,

    Permission.EVENT_CREATE,
    Permission.EVENT_UPDATE,
    Permission.EVENT_DELETE,

    Permission.REVIEW_ASSIGN,
  ],
  [Role.ORGANIZATION_ADMIN]: [
    Permission.ORGANIZATION_READ,

    Permission.EVENT_CREATE,
    Permission.EVENT_UPDATE,
  ],

  [Role.PROGRAM_CHAIR]: [Permission.EVENT_UPDATE, Permission.REVIEW_ASSIGN],

  [Role.REVIEWER]: [Permission.REVIEW_SUBMIT],

  [Role.SPEAKER]: [Permission.PROPOSAL_SUBMIT],
};
