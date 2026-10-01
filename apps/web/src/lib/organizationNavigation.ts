export const ORGANIZATION_ROUTE_PATTERN = '/organizations/:organizationSlug';

export const getOrganizationPath = (slug: string): string => 
  `/organizations/${encodeURIComponent(slug)}`;
