import { Link, Outlet } from 'react-router';
import { PanelsTopLeft } from 'lucide-react';

import { ThemeSelect } from './ThemeSelect';
import { useAuth } from '@/features/auth/context/auth';
import { buttonVariants } from '@/constants/variants';

export const AppShell = () => {
  const { session } = useAuth();
  const accountLink =
    session.status === 'active'
      ? { path: '/app', label: 'Workspace' }
      : session.status === 'verify' || session.status === 'error'
        ? {
            path: '/verify-email',
            label: 'Verify email',
          }
        : {
            path: '/sign-in',
            label: 'Sign in',
          };
  return (
    <div id="top" className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-10 focus:rounded-md focus:bg-background focus:px-4 focus:py-3 focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      <header className="border-b border-border/70 bg-card gap-2 sm:gap-4">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <a
            href="/#top"
            className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-md font-bold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <PanelsTopLeft aria-hidden="true" className="size-5" />
            </span>
            StageGate
          </a>
          <div className="flex items-center gap-2 sm:gap-7">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-6 sm:flex"
            >
              <a
                href="/#workflow"
                className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                Workflow
              </a>
              <a
                href="/#speakers"
                className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                For Speakers
              </a>
            </nav>
            {session.status !== 'loading' && (
              <Link
                to={accountLink.path}
                className={buttonVariants({
                  size: 'lg',
                  className: 'min-h-11 px-3',
                })}
              >
                {accountLink.label}
              </Link>
            )}
            <ThemeSelect />
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border/70 bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-1 px-4 py-4 sm:px-8">
          <span className="text-sm font-semibold">StageGate</span>
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-5 text-sm font-medium text-muted-foreground"
          >
            <a
              href="/#workflow"
              className="inline-flex min-h-11 items-center rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              Workflow
            </a>
            <a
              href="/#speakers"
              className="inline-flex min-h-11 items-center rounded-sm hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              For speakers
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};
