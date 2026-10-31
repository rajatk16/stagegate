export const getEventWorkspacePath = (
  organizationSlug: string,
  eventSlug: string,
  section: '' | 'team' | 'settings' = '',
): string => {
  const base =
    `/organizations/${encodeURIComponent(organizationSlug)}` +
    `/events/${encodeURIComponent(eventSlug)}`;

  return section ? `${base}/${section}` : base;
};
