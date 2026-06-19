import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { Button } from '../ui';

const subscribe = () => () => {};

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  );
};
