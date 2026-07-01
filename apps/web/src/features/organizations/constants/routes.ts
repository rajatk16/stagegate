export const ORGANIZATION_ROUTES = {
  ROOT: '/organizations',

  CREATE: '/organizations/new',

  DETAIL: (slug: string) => `/organizations/${slug}`,

  SETTINGS: (slug: string) => `/organizations/${slug}/settings`,

  MEMBERS: (slug: string) => `/organizations/${slug}/members`,

  MEMBER: (slug: string, memberId: string) =>
    `/organizations/${slug}/members/${memberId}`,

  INVITATIONS: (slug: string) => `/organizations/${slug}/members/invitations`,

  GENERAL_SETTINGS: (slug: string) => `/organizations/${slug}/settings/general`,

  DANGER_ZONE: (slug: string) => `/organizations/${slug}/settings/danger-zone`,
};
