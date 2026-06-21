import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/api/queryClient';

import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { BootstrapProvider } from './BootstrapProvider';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BootstrapProvider>{children}</BootstrapProvider>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </ThemeProvider>
);
