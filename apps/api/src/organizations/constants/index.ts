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
