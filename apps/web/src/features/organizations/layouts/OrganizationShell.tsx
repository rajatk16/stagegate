import { Link, NavLink, Outlet, useParams } from 'react-router';

import { Badge, Button, InlineAlert } from '@/components';
import { getOrganizationSectionPath, ORGANIZATION_SECTIONS } from '@/lib';

import { useOrganizations } from '../hooks';
import { hasOrganizationCapability } from '../services';

export const OrganizationShell = () => {
  const { organizationSlug } = useParams<{
    organizationSlug: string;
  }>();

  const { state, reload } = useOrganizations();

  if (state.status === 'loading') {
    return (
      <div
        role="status"
        className="rounded-2xl border bg-card p-6 text-muted-foreground"
      >
        Loading your organization...
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Could not load this workspace">
          {state.message}
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={reload}
        >
          Try again
        </Button>
      </div>
    );
  }

  const organization = state.organizations.find(
    (item) => item.slug === organizationSlug,
  );

  if (!organization) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="warning" title="Organization unavailable">
          This organization could not be found in your memberships. Refresh the
          list or choose another organization.
        </InlineAlert>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={reload}
          >
            Refresh organizations
          </Button>

          <Button asChild className="min-h-11">
            <Link to="/organizations">Go to my organizations</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!hasOrganizationCapability(organization, 'organization:read')) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="warning" title="Organization access available">
          Your account does not currently have access to this organization's
          workspace.
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={reload}
        >
          Refresh access
        </Button>
      </div>
    );
  }

  const visibleSections = Object.values(ORGANIZATION_SECTIONS).filter(
    (section) => hasOrganizationCapability(organization, section.capability),
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="capitalize">
            {organization.membership.role.toLowerCase()}
          </Badge>
        </div>

        <h1 className="wrap-break-word text-3xl font-semibold tracking-tight">
          {organization.name}
        </h1>

        <p className="break-all text-sm text-muted-foreground">
          {organization.slug}
        </p>
      </header>

      <nav
        aria-label="Organization navigation"
        className="flex flex-wrap gap-2 border-b pb-3"
      >
        {visibleSections.map((section) => (
          <NavLink
            key={section.segment}
            to={getOrganizationSectionPath(organization.slug, section.segment)}
            end={section.segment === ''}
            className={({ isActive }) =>
              [
                'rounded-xl px-4 py-3 text-sm',
                'focus-visible:outline-2',
                'focus-visible:outline-offset-2',
                'focus-visible:outline-ring',
                isActive
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent',
              ].join(' ')
            }
          >
            {section.label}
          </NavLink>
        ))}
      </nav>

      <Outlet key={organization.id} context={organization} />
    </div>
  );
};
