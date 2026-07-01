import { OrganizationSwitcher } from '@/features/organizations';

import { SidebarTrigger } from './SidebarTrigger';

export const TopNavigationStart = () => {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <OrganizationSwitcher />
    </div>
  );
};
