import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const systemOption = { value: 'system', label: 'System', icon: Monitor };
const themeOptions = [
  systemOption,
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
  },
];

export const ThemeSelect = () => {
  const { theme, setTheme } = useTheme();
  const selected =
    themeOptions.find((option) => option.value === theme) ?? systemOption;
  const SelectedIcon = selected.icon;

  return (
    <Select
      items={themeOptions}
      value={selected.value}
      onValueChange={(value) => {
        if (value !== null) setTheme(value);
      }}
    >
      <SelectTrigger
        aria-label="Color theme"
        title={`Color theme: ${selected.label}`}
        data-theme={selected.value}
        className="min-h-11 w-11 justify-center rounded-full border-input bg-background p-0 shadow-xs hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/40 dark:bg-background dark:hover:bg-accent [&>svg:last-child]:hidden"
      >
        <SelectValue className="flex-none justify-center">
          <SelectedIcon aria-hidden="true" className="size-5 text-primary" />
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        sideOffset={8}
        className="min-w-36 rounded-xl border border-border bg-popover p-1 shadow-lg"
      >
        <SelectGroup>
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <SelectItem
              key={value}
              value={value}
              className="min-h-11 rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Icon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
