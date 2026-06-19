import { useTheme } from 'next-themes';

export const useThemeMode = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return {
    theme,
    setTheme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };
};
