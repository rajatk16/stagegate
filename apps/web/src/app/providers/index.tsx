import type { PropsWithChildren } from 'react';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToasterProvider } from './ToasterProvider';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
    <ToasterProvider />
  </ThemeProvider>
);
