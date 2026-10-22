import { matchPath, NavLink, useLocation } from 'react-router';
import { Mail, UserRound, LayoutDashboard } from 'lucide-react';

import {
  useAuth,
  AuthStatus,
  useOrganizations,
  OrganizationSwitcher,
} from '@/features';

import { PageContent } from './PageContent';
import { SiteBrand, SiteFooter, SkipLink, ThemeToggle } from '../components';
import { getOrganizationPath, ORGANIZATION_ROUTE_PATTERN } from '@/lib';
import { isRecord } from '../utils';
import { InlineAlert } from '@/components';

export const AppShell = () => {
  const session = useAuth();
  const location = useLocation();
  const { state } = useOrganizations();

  const match = matchPath(
    {
      path: ORGANIZATION_ROUTE_PATTERN,
      end: false,
    },
    location.pathname,
  );

  const organizations = state.status === 'ready' ? state.organizations : [];

  const activeOrganization = organizations.find(
    (organization) => organization.slug === match?.params.organizationSlug,
  );

  const dashboardOrganization = activeOrganization ?? organizations[0];

  const dashboardPath = dashboardOrganization
    ? getOrganizationPath(dashboardOrganization.slug)
    : '/dashboard';

  const navigation = [
    {
      to: dashboardPath,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/invitations',
      label: 'Invitations',
      icon: Mail,
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: UserRound,
    },
  ];

  const navigationState: unknown = location.state;
  const leftOrganization =
    session.status === 'authenticated' &&
    isRecord(navigationState) &&
    isRecord(navigationState.leftOrganization) &&
    navigationState.leftOrganization.uid === session.user.uid &&
    typeof navigationState.leftOrganization.name === 'string'
      ? navigationState.leftOrganization.name
      : null;

  return (
    <div className="stagegate-surface min-h-screen bg-background text-foreground">
      <SkipLink />

      <div className="mx-auto min-h-screen md:grid md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b bg-card/70 p-5 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-6">
          <SiteBrand to={dashboardPath} />

          <div className="mt-6">
            <OrganizationSwitcher />
          </div>

          <nav
            aria-label="Workspace navigation"
            className="mt-5 flex flex-wrap gap-2 lg:mt-10 lg:flex-col"
          >
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                end
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm',
                    'transition-colors focus-visible:outline-2',
                    'focus-visible:outline-offset-2 focus-visible:outline-ring',
                    isActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  ].join(' ')
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-background/80 px-6 py-4 md:px-10">
            <p className="text-sm font-medium">StageGate workspace</p>

            <div className="flex flex-wrap items-center gap-3">
              <AuthStatus />
              <ThemeToggle />
            </div>
          </header>

          {leftOrganization !== null && (
            <div className="mx-auto w-full max-w-6xl px-6 pt-6 md:px-10">
              <InlineAlert tone="success" title="You left the organization">
                You no longer have access to {leftOrganization}. You will need a
                new invitation to return.
              </InlineAlert>
            </div>
          )}

          <PageContent className="mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14" />

          <SiteFooter />
        </div>
      </div>
    </div>
  );
};
