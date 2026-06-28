import { SidebarTrigger } from './SidebarTrigger';
import { OrganizationSwitcher } from './OrganizationSwitcher';

export const TopNavigationStart = () => {
  return (
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <OrganizationSwitcher />
    </div>
  );
};
