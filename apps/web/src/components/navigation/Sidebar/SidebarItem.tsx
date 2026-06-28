import { NavLink } from 'react-router-dom';

import { cn } from '@/lib';

import type { SidebarItemModel } from './types';

export const SidebarItem = ({ item }: { item: SidebarItemModel }) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      aria-disabled={item.disabled}
      onClick={(event) => {
        if (item.disabled) {
          event.preventDefault();
        }
      }}
      className={({ isActive }) =>
        cn(
          'flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors',
          item.disabled && 'cursor-not-allowed opacity-50',
          !item.disabled && 'hover:bg-accent',
          isActive && !item.disabled && 'bg-accent font-medium',
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded bg-muted px-2 py-0.5 text-xs">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};
