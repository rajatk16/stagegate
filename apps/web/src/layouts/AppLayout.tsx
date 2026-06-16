import { Link, Outlet } from "react-router-dom";

export const AppLayout = () => (
  <div className="flex min-h-screen bg-slate-950 text-white">
    <aside className="w-56 border-r border-white/10 p-4">
      <p className="font-semibold mb-4">StageGate</p>
      <nav className="flex flex-col gap-2 text-sm text-slate-400">
        <Link to="/app/dashboard">Dashboard</Link>
        <Link to="/app/events">Events</Link>
      </nav>
    </aside>

    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);
