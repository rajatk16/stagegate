export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PAGE_SIZE = 20;
export const ORGANIZATION_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
export const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ORGANIZATION_CAPABILITIES = [
  'organization:read',
  'organization:update',
  'organization:members:read',
  'organization:members:manage',
];
