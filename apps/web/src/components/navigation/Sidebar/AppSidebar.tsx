import { Link } from 'react-router-dom';

import { buildHomeRoute, useSidebar } from '@/app';

import { SidebarFooter } from './SidebarFooter';
import type { SidebarGroupModel } from './types';
import { SidebarContent } from './SidebarContent';

export const AppSidebar = ({
  navigation,
}: {
  navigation: SidebarGroupModel[];
}) => {
  const { collapsed } = useSidebar();
  return (
    <aside
      className={`hidden ${collapsed ? 'w-20' : 'w-72'} shrink-0 border-r bg-background lg:flex lg:flex-col`}
    >
      <div className="border-b p-6">
        <Link to={buildHomeRoute()} className="text-xl font-bold">
          StageGate
        </Link>
      </div>

      <SidebarContent navigation={navigation} />

      <SidebarFooter />
    </aside>
  );
};
