export const ORGANIZATION_ROUTES = {
  CREATE: '/organizations/new',
  MEMBERS: (slug: string) => `/organizations/${slug}/members`,
  SETTINGS: (slug: string) => `/organizations/${slug}/settings`,
  DASHBOARD: (slug: string) => `/organizations/${slug}/dashboard`,
};
