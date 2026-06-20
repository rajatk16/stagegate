import { Bell } from 'lucide-react';

import { UserMenu } from './UserMenu';
import { MobileSidebar } from './MobileSidebar';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useMatches } from 'react-router-dom';

import type { AppUIMatch } from '@/app/router/routeHandles';

export const TopNav = () => {
  const matches = useMatches() as AppUIMatch[];

  const title = matches.at(-1)?.handle?.title ?? 'StageGate';
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <MobileSidebar />
        </div>

        <h1 className="text-lg font-semibold">{title}</h1>
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
};
