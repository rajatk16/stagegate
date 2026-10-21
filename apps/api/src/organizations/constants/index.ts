import { ORGANIZATION_ROLES } from '../enums';
import type { OrganizationPermission } from '../types';
import type { OrganizationMembership } from '../models';

export const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const RESERVED_ORGANIZATION_SLUGS = new Set([
  'admin',
  'api',
  'auth',
  'billing',
  'health',
  'login',
  'logout',
  'new',
  'settings',
  'support',
  'www',
]);

export const ORGANIZATIONS_COLLECTION = 'organizations';
export const ORGANIZATION_MEMBERSHIPS_COLLECTION = 'memberships';
export const ORGANIZATION_SLUGS_COLLECTION = 'organizationSlugs';

export const ORGANIZATION_ROLE_PERMISSIONS: Readonly<
  Record<OrganizationMembership['role'], readonly OrganizationPermission[]>
> = {
  VIEWER: ['organization:read', 'organization:events:read'],
  MEMBER: [
    'organization:read',
    'organization:members:read',
    'organization:events:read',
  ],
  ADMIN: [
    'organization:read',
    'organization:update',
    'organization:events:read',
    'organization:members:read',
    'organization:events:create',
    'organization:members:manage',
  ],
  OWNER: [
    'organization:read',
    'organization:update',
    'organization:audit:read',
    'organization:events:read',
    'organization:members:read',
    'organization:events:create',
    'organization:members:manage',
    'organization:ownership:transfer',
  ],
};

export const ORGANIZATION_SCOPE_KEY = 'organization:scope';

export const ORGANIZATION_PERMISSIONS_KEY = 'organization:requiredPermissions';

export const ORGANIZATION_ROLE_CHANGE_TARGETS: Readonly<
  Record<ORGANIZATION_ROLES, readonly ORGANIZATION_ROLES[]>
> = {
  OWNER: [
    ORGANIZATION_ROLES.ADMIN,
    ORGANIZATION_ROLES.MEMBER,
    ORGANIZATION_ROLES.VIEWER,
  ],
  ADMIN: [ORGANIZATION_ROLES.MEMBER, ORGANIZATION_ROLES.VIEWER],
  MEMBER: [],
  VIEWER: [],
};
