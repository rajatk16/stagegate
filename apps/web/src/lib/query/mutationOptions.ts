import type { QueryClient, QueryKey } from '@tanstack/react-query';

export interface AppMutationOptions {
  queryClient: QueryClient;
  invalidate?: readonly QueryKey[];
  successMessage?: string;
  errorMessage?: string;
}
