import type { PropsWithChildren } from 'react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

export const ThemeProvider = (props: PropsWithChildren) => (
  <NextThemeProvider
    enableSystem
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
  >
    {props.children}
  </NextThemeProvider>
);
