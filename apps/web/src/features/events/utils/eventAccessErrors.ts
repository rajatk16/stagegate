import { ApiError } from '@/lib';

export const getEventAccessProblem = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return {
        kind: 'session' as const,
        title: 'Sign-in required',
        description:
          'Your session could not be verified. Sign in again to continue.',
      };
    }

    if (error.status === 403) {
      return {
        kind: 'denied' as const,
        title: 'Access denied',
        description:
          error.code === 'EVENT_MEMBERSHIP_INACTIVE'
            ? 'Your event membership is suspended. An authorized administrator must reactivate it.'
            : 'Your current organization or event access does not allow this operation.',
      };
    }

    if (error.status === 404) {
      return {
        kind: 'unavailable' as const,
        title: 'Event unavailable',
        description:
          'This event could not be found or is not available to your account.',
      };
    }
  }

  return {
    kind: 'request' as const,
    title: 'Could not load event access',
    description:
      'The latest request failed. Check your connection and try again.',
  };
};
