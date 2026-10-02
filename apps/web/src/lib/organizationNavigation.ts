export const ORGANIZATION_ROUTE_PATTERN = '/organizations/:organizationSlug';


export const ORGANIZATION_SECTIONS = {
  overview: {
    segment: "",
    label: "Overview",
    capability: "organization:read",
    actionLabel: null
  },
  settings: {
    segment: "settings",
    label: "Settings",
    capability: "organization:update",
    actionLabel: "Organization settings"
  },
  members: {
    segment: "members",
    label: 'Members',
    capability: "organization:members:manage",
    actionLabel: "Manage members"
  }
}

export const getOrganizationPath = (slug: string): string => `/organizations/${encodeURIComponent(slug)}`;

export const getOrganizationSectionPath = (
  slug: string,
  segment: string
): string => {
  const basePath = getOrganizationPath(slug);

  return segment ? `${basePath}/${segment}` : basePath;
}
