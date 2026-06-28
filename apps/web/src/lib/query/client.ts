import { AxiosError } from 'axios';
import { QueryClient } from '@tanstack/react-query';

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error instanceof AxiosError && error?.response?.status === 401) {
          return false;
        }
        if (error instanceof AxiosError && error?.response?.status === 401) {
          return false;
        }

        return failureCount < 3;
      },
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
