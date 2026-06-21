import { Outlet } from 'react-router-dom';

export const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
    <Outlet />
  </div>
);
