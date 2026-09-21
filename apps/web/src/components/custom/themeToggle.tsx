import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';

import { Button } from '../ui';

const themes = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor
  }
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div role="group" aria-label="Color theme" className='flex items-center gap-1 rounded-xl border bg-card p-1'>
      {themes.map(({ value, label, icon: Icon}) => (
        <Button key={value} type='button' size='icon' variant={theme === value ? 'secondary' : 'ghost'} aria-label={`${label} theme`} aria-pressed={theme === value} title={`${label} theme`} onClick={() => setTheme(value)}>
          <Icon className='size-4' aria-hidden='true' />
        </Button>
      ))}
    </div>
  )
}