import { Outlet } from 'react-router-dom';

export const AppContent = () => (
  <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
    <Outlet />
  </main>
);
