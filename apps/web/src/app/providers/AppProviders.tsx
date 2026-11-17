import { ApiProvider } from '@/api/apiProvider';
import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';
import { Toaster } from '@/components/ui/Sonner';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

import type { PropsWithChildren } from 'react';

export const AppProviders = (props: PropsWithChildren) => (
  <AppErrorBoundary>
    <ThemeProvider>
      <ApiProvider>
        <QueryProvider>
          {props.children}
          <Toaster />
        </QueryProvider>
      </ApiProvider>
    </ThemeProvider>
  </AppErrorBoundary>
);
