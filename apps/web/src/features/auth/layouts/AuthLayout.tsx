import { ArrowLeft } from 'lucide-react';
import { Link, Outlet } from 'react-router';

import { PageContent } from '@/app/layouts';
import { SiteBrand, SiteFooter, SkipLink, ThemeToggle } from '@/app/components';

import { SessionBoundary } from '../components';

export const AuthLayout = () => (
  <div className="stagegate-surface flex min-h-screen flex-col bg-background text-foreground">
    <SkipLink />

    <header className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
      <SiteBrand />
      <ThemeToggle />
    </header>

    <SessionBoundary>
      <PageContent className="mx-auto w-full max-w-xl px-6 py-8 md:py-12">
        <Link
          to="/"
          className="mb-8 inline-flex min-h-11 items-center gap-2 rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to home
        </Link>

        <Outlet />
      </PageContent>
    </SessionBoundary>

    <SiteFooter />
  </div>
);
