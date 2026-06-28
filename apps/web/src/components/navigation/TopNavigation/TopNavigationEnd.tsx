import { ThemeToggle } from '@/components/theme';

import { SearchButton } from './SearchButton';
import { NotificationButton } from './NotificationButton';
import { AuthenticatedUserMenu } from './AuthenticatedUserMenu';

export const TopNavigationEnd = () => {
  return (
    <div className="flex items-center gap-2">
      <SearchButton />
      <NotificationButton />
      <ThemeToggle />
      <AuthenticatedUserMenu />
    </div>
  );
};
