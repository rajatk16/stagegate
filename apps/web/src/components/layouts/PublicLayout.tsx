import { Outlet } from 'react-router-dom';

import { PublicNavbar, PublicFooter } from '../navigation';

export const PublicLayout = () => (
  <div className="flex flex-col min-h-screen">
    <PublicNavbar />

    <main className="flex-1">
      <Outlet />
    </main>

    <PublicFooter />
  </div>
);
