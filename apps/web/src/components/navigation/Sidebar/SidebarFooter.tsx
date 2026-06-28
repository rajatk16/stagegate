import { ThemeToggle } from '@/components/theme';

import { AuthenticatedUserMenu } from '../PublicNavBar/AuthenticatedUserMenu';

export const SidebarFooter = () => {
  return (
    <div className="flex items-center justify-between border-t p-4">
      <ThemeToggle />
      <AuthenticatedUserMenu />
    </div>
  );
};
