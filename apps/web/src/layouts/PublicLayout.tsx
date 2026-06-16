import { Outlet } from "react-router-dom";

export const PublicLayout = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <Outlet />
  </div>
);
