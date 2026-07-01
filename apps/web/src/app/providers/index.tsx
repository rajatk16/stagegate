import type { PropsWithChildren } from 'react';

import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { ToasterProvider } from './ToasterProvider';
import { OrganizationProvider } from './OrganizationProvider';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>
    <QueryProvider>
      <AuthProvider>
        <OrganizationProvider>{children}</OrganizationProvider>
      </AuthProvider>
    </QueryProvider>
    <ToasterProvider />
  </ThemeProvider>
);
