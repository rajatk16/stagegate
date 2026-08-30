import { Link, NavLink, Outlet } from 'react-router';

import { routes } from '../../app/routes';
import { environment } from '../../config/environment';

const navigationItems = [
  {
    label: 'Dashboard',
    to: routes.dashboard,
    end: true,
  },
  {
    label: 'Events',
    to: routes.events,
    end: false,
  },
] as const;

function Navigation() {
  return (
    <nav aria-label="Primary navigation">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {navigationItems.map((item) => (
          <li key={item.to}>
            <NavLink
              className={({ isActive }) =>
                [
                  'block rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
              end={item.end}
              to={item.to}
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell() {
  const showEnvironment = environment.appEnvironment !== 'production';

  return (
    <div className="min-h-dvh bg-slate-50">
      <a
        className="bg-brand-600 fixed top-2 left-2 z-50 -translate-y-20 rounded-md px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-slate-950" to={routes.dashboard}>
            {environment.appName}
          </Link>

          <div className="flex items-center gap-3">
            {showEnvironment ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 uppercase">
                {environment.appEnvironment}
              </span>
            ) : null}

            <Link
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              to={routes.settings}
            >
              Settings
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white px-4 py-3 md:min-h-[calc(100dvh-4rem)] md:border-r md:border-b-0 md:px-4 md:py-6">
          <Navigation />
        </aside>

        <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-8" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
