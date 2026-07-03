import { Link } from 'react-router-dom';

import { buildHomeRoute } from '@/app';

import type { SidebarGroupModel } from './types';
import { SidebarContent } from './SidebarContent';

export const AppSidebar = ({
  navigation,
}: {
  navigation: SidebarGroupModel[];
}) => {
  return (
    <aside
      className={`hidden w-72 shrink-0 border-r bg-background lg:flex lg:flex-col`}
    >
      <div className="border-b p-4">
        <Link to={buildHomeRoute()} className="text-xl font-bold">
          StageGate
        </Link>
      </div>

      <SidebarContent navigation={navigation} />
    </aside>
  );
};
