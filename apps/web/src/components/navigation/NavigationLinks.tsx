import { NavLink } from 'react-router';

import { cn } from '@/lib/utils';

import type { NavigationItem } from './navigationConfig';

interface Props {
  items: NavigationItem[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

export const NavigationLinks = ({ items, collapsed = false, onNavigate }: Props) => (
  <nav aria-label="Workspace navigation" className="space-y-1">
    {items.map(({ label, to, icon: Icon, end }) => (
      <NavLink
        key={to}
        to={to}
        end={end ?? false}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium',
            'transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
            collapsed && 'justify-center px-0',
          )
        }
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />

        {!collapsed && <span>{label}</span>}
      </NavLink>
    ))}
  </nav>
);
