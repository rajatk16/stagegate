export const queryKeys = {
  health: {
    all: ['health'],
    liveness: () => ['health', 'liveness'],
    readiness: () => ['health', 'readiness'],
  },
  session: {
    all: ['session'],
    current: () => ['session', 'current'],
  },
  organizations: {
    all: ['organizations'],
    lists: () => ['organizations', 'list'],
    list: () => ['organizations', 'list', 'all'],
    details: () => ['organizations', 'detail'],

    detail: (organizationSlug: string) => ['organizations', 'detail', organizationSlug],
  },
  events: {
    all: (organizationSlug: string) => ['organizations', 'detail', organizationSlug, 'events'],
    list: (organizationSlug: string) => [
      'organizations',
      'detail',
      organizationSlug,
      'events',
      'list',
    ],
    detail: (organizationSlug: string, eventSlug: string) => [
      'organizations',
      'detail',
      organizationSlug,
      'events',
      'detail',
      eventSlug,
    ],
  },
};
