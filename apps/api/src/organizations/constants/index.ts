import { OrganizationPermission } from '../types';
import { OrganizationMembership } from '../models';

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
  OWNER: [
    'organization:read',
    'organization:update',
    'organization:members:manage',
  ],
};

export const ORGANIZATION_SCOPE_KEY = 'organization:scope';

export const ORGANIZATION_PERMISSIONS_KEY = 'organization:requiredPermissions';
