export const queryKeys = {
  session: {
    all: ['session'],
    current: () => ['session', 'current'],
  },

  organizations: {
    all: ['organizations'],

    list: () => ['organizations', 'list'],

    detail: (organizationSlug: string) => ['organizations', organizationSlug],
  },

  events: {
    all: (organizationSlug: string) => ['organizations', organizationSlug, 'events'],

    list: (organizationSlug: string) => ['organizations', organizationSlug, 'events', 'list'],

    detail: (organizationSlug: string, eventSlug: string) => [
      'organizations',
      organizationSlug,
      'events',
      eventSlug,
    ],
  },
};
