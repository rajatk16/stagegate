import type { PropsWithChildren } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { client } from '@/lib';

import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToasterProvider } from './ToasterProvider';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <QueryClientProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
    <ToasterProvider />
  </ThemeProvider>
);
