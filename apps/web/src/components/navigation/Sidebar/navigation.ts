import { CalendarDays, LayoutDashboard, Settings, Users } from 'lucide-react';

import type { SidebarGroupModel } from './types';

export const appNavigation: SidebarGroupModel[] = [
  {
    id: 'main',

    items: [
      {
        id: 'dashboard',

        label: 'Dashboard',

        href: '/app',

        icon: LayoutDashboard,
      },

      {
        id: 'events',

        label: 'Events',

        href: '#',

        icon: CalendarDays,

        disabled: true,
      },

      {
        id: 'members',

        label: 'Members',

        href: '#',

        icon: Users,

        disabled: true,
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

        href: '#',

        icon: Settings,

        disabled: true,
      },
    ],
  },
];
