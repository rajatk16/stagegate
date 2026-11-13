import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { usePreferencesStore } from '@/stores/preferences.store';

import type { Theme } from '@/stores/preferences.store';

const nextTheme: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export const ThemeToggle = () => {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);

  const Icon = themeIcons[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${theme}. Switch to ${nextTheme[theme]} theme`}
      title={`Theme: ${theme}`}
      onClick={() => {
        setTheme(nextTheme[theme]);
      }}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
};
