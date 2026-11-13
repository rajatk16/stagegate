export const paths = {
  home: '/',

  app: {
    root: '/app',

    organization: (organizationSlug: string) => `/app/${encodeURIComponent(organizationSlug)}`,

    events: (organizationSlug: string) => `/app/${encodeURIComponent(organizationSlug)}/events`,

    event: (organizationSlug: string, eventSlug: string) =>
      `/app/${encodeURIComponent(organizationSlug)}/events/${encodeURIComponent(eventSlug)}`,
  },

  speaker: {
    root: '/speaker',
    proposals: '/speaker/proposals',
  },

  unauthorized: '/unauthorized',
};
