import { QueryClient } from '@tanstack/react-query';

import { isApiError } from '@stagegate/apiClient';

const MAX_QUERY_RETRIES = 2;

const MAX_RETRY_DELAY_MS = 30000;

export const shouldRetryQuery = (failureCount: number, error: unknown): boolean => {
  if (failureCount >= MAX_QUERY_RETRIES || !isApiError(error) || !error.isRetryable) {
    return false;
  }

  if (error.retryAfterMs !== undefined && error.retryAfterMs > MAX_RETRY_DELAY_MS) {
    return false;
  }

  return true;
};

export const getQueryRetryDelay = (
  attemptIndex: number,

  error: unknown,
): number => {
  if (isApiError(error) && error.retryAfterMs !== undefined) {
    return Math.min(
      error.retryAfterMs,

      MAX_RETRY_DELAY_MS,
    );
  }

  const exponentialDelay = Math.min(1000 * 2 ** attemptIndex, MAX_RETRY_DELAY_MS);

  const jitter = Math.random() * 250;

  return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY_MS);
};

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 300_000,
        retry: shouldRetryQuery,
        retryDelay: getQueryRetryDelay,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        networkMode: 'online',
      },
      mutations: {
        retry: false,
        networkMode: 'online',
      },
    },
  });
