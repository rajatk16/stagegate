import { Outlet } from 'react-router-dom';

import { Sidebar, TopNav } from './components';

export const AppLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />

    <div className="flex flex-1 flex-col">
      <TopNav />

      <main className="flex-1 overflow-auto bg-muted/20 p-6">
        <Outlet />
      </main>
    </div>
  </div>
);
