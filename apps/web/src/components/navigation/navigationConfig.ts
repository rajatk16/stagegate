import { FileText, LayoutDashboard, type LucideIcon } from 'lucide-react';

import { paths } from '@/app/router/paths';

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const appNavigation: NavigationItem[] = [
  {
    label: 'Overview',
    to: paths.app.root,
    icon: LayoutDashboard,
    end: true,
  },
];

export const speakerNavigation: NavigationItem[] = [
  {
    label: 'Overview',
    to: paths.speaker.root,
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: 'My proposals',
    to: paths.speaker.proposals,
    icon: FileText,
  },
];
