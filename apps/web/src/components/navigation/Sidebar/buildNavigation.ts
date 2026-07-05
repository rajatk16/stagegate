import { appNavigation } from './navigation';
import type { SidebarGroupModel } from './types';

interface BuildNavigationOptions {
  organizationSlug?: string;
}

export const buildNavigation = ({
  organizationSlug,
}: BuildNavigationOptions): SidebarGroupModel[] => {
  if (!organizationSlug) {
    return [];
  }

  return appNavigation.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      href: item.href.replace(':slug', organizationSlug),
    })),
  }));
};
