import { Outlet } from 'react-router-dom';

import { TopNavigation } from '../navigation';

export const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavigation />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
