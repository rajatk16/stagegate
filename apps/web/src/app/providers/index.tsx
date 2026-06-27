import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/api';

import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </ThemeProvider>
);
