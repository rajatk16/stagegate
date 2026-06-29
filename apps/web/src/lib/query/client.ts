import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { parseError } from '../errors';
import { notificationService } from '../notifications';

const shouldRetry = (failureCount: number): boolean => failureCount < 3;

export const client = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query Error: ', error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.log('Mutation Error: ', error);
      const appError = parseError(error);
      notificationService.error('Something went wrong.', {
        description: appError.message,
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});
