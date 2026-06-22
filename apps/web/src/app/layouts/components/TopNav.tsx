import { Bell } from 'lucide-react';
import { useMatches } from 'react-router-dom';

import type { AppUIMatch } from '@/app';
import { ThemeToggle } from '@/components/theme';
import { useCurrentOrganization } from '@/features/organizations';

import { UserMenu } from './UserMenu';
import { MobileSidebar } from './MobileSidebar';

export const TopNav = () => {
  const matches = useMatches() as AppUIMatch[];

  const title = matches.at(-1)?.handle?.title ?? 'StageGate';

  const organization = useCurrentOrganization();
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-3">
        <div className="lg:hidden">
          <MobileSidebar />
        </div>

        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-xs text-muted-foreground">{organization?.name}</p>
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
