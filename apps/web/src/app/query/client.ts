import { QueryCache, QueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib';
import { queryKeys } from './keys';

export const isAccessError = (error: unknown): boolean =>
  error instanceof ApiError &&
  (error.status === 401 || error.status === 403 || error.status === 404);

const shouldRetryQuery = (failureCount: number, error: Error): boolean => {
  if (failureCount >= 1 || !(error instanceof ApiError)) {
    return false;
  }

  return (
    error.kind === 'network' ||
    error.kind === 'timeout' ||
    (error.status !== undefined && error.status >= 500)
  );
};

export const createAppQueryClient = (): QueryClient => {
  const client: QueryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const key = query.queryKey;

        if (
          isAccessError(error) &&
          key[0] === 'account' &&
          typeof key[1] === 'string' &&
          key[2] === 'organization'
        ) {
          void client.invalidateQueries({
            queryKey: queryKeys.organizations(key[1]),
            exact: true,
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: shouldRetryQuery,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        networkMode: 'always',
      },
      mutations: {
        retry: false,
        networkMode: 'always',
        gcTime: 0,
      },
    },
  });

  return client;
};
