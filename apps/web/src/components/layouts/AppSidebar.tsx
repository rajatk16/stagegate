import { Link } from 'react-router-dom';

import { buildHomeRoute } from '@/app';

export const AppSidebar = () => (
  <aside className="hidden w-72 shrink-0 border-r bg-background lg:flex lg:flex-col">
    <div className="border-b p-6">
      <Link to={buildHomeRoute()} className="text-xl font-bold">
        StageGate
      </Link>
    </div>

    <nav className="flex-1 px-4" />
  </aside>
);
