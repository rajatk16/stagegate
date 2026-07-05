import { CalendarDays, LayoutDashboard, Settings, Users } from 'lucide-react';

import type { SidebarGroupModel } from './types';

export const appNavigation: SidebarGroupModel[] = [
  {
    id: 'main',

    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/organizations/:slug/dashboard',
        icon: LayoutDashboard,
        disabled: false,
      },
      {
        id: 'events',
        label: 'Events',
        href: '/organizations/:slug/events',
        icon: CalendarDays,
        disabled: true,
      },
      {
        id: 'members',
        label: 'Members',
        href: '/organizations/:slug/members',
        icon: Users,
        disabled: false,
      },
    ],
  },

  {
    id: 'settings',
    title: 'Settings',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        href: '/organizations/:slug/settings',
        icon: Settings,
        disabled: false,
      },
    ],
  },
];
