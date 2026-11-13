import { Link, Outlet } from 'react-router';

import { paths } from '@/app/router/paths';
import { StageGateLogo } from '@/components/branding/StageGateLogo';
import { RouteFocus } from '@/components/common/RouteFocus';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/Button';

export const PublicLayout = () => (
  <div className="flex min-h-screen flex-col">
    <a
      href="#main-content"
      className="sr-only z-100 rounded-md bg-background p-3 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      Skip to main content
    </a>

    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <StageGateLogo />

        <nav aria-label="Public navigation" className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to={paths.speaker.root}>Speakers</Link>
          </Button>

          <ThemeToggle />

          <Button size="sm" asChild>
            <Link to={paths.app.root}>Open app</Link>
          </Button>
        </nav>
      </div>
    </header>

    <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
      <RouteFocus />
      <Outlet />
    </main>

    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <StageGateLogo />

        <p>From Call for Papers to Conference Stage.</p>

        <Link to={paths.speaker.root} className="hover:underline">
          Speaker portal
        </Link>
      </div>
    </footer>
  </div>
);
