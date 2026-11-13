import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10_000),
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
