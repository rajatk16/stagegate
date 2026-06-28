import type { LucideIcon } from 'lucide-react';

export interface SidebarItemModel {
  id: string;

  label: string;

  href: string;

  icon: LucideIcon;

  badge?: string;

  disabled?: boolean;
}

export interface SidebarGroupModel {
  id: string;

  title?: string;

  items: SidebarItemModel[];
}
