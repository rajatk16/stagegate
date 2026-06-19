import type { PropsWithChildren } from 'react';
import { ThemeProvider } from './ThemeProvider';

export const AppProviders = ({ children }: PropsWithChildren) => (
  <ThemeProvider>{children}</ThemeProvider>
);
