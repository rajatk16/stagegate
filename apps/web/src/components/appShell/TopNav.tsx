import { Bell } from 'lucide-react';

import { UserMenu } from './UserMenu';
import { MobileSidebar } from './MobileSidebar';
import { ThemeToggle } from '../theme/ThemeToggle';

export const TopNav = () => (
  <header className="flex h-16 items-center justify-between border-b px-6">
    <div className="flex items-center gap-3">
      <div className="lg:hidden">
        <MobileSidebar />
      </div>

      <h1 className="text-lg font-semibold">Dashboard</h1>
    </div>

    <div className="flex items-center gap-4">
      <ThemeToggle />
      <button className="relative">
        <Bell size={20} />
      </button>

      <UserMenu />
    </div>
  </header>
);
