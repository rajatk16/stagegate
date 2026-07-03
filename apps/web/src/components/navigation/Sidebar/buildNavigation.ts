import { appNavigation } from './navigation';
import type { SidebarGroupModel } from './types';

interface BuildNavigationOptions {
  organizationSlug?: string;
}

export const buildNavigation = ({
  organizationSlug,
}: BuildNavigationOptions): SidebarGroupModel[] => {
  if (!organizationSlug) {
    return appNavigation;
  }

  return appNavigation.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      href:
        item.href === '#'
          ? '#'
          : `/organizations/${organizationSlug}/${item.id}`,
    })),
  }));
};
