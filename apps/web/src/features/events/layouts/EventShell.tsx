import type { User } from 'firebase/auth';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useParams } from 'react-router';

import { useAuth } from '@/features/auth';
import { InlineAlert } from '@/components';
import { useActiveOrganization } from '@/features/organizations';
import { useEventAccessQuery, useEventQuery } from '@/app/query';
import { getEventWorkspacePath, getOrganizationPath } from '@/lib';

import { EVENT_SECTIONS } from '../constants';
import { findEventBySlug } from '../services';
import { EventAccessDenied } from '../components';
import { EventWorkspaceContext } from '../context';
import {
  hasEventPermission,
  hasActiveEventAccess,
  getEventAccessProblem,
  getEffectiveEventCapabilities,
} from '../utils';
import { SLUG_PATTERN } from '@/app/constants';

type Props = {
  user: User;
  organizationId: string;
  organizationSlug: string;
  eventId: string;
  eventSlug: string;
};

const EventWorkspaceLoader = ({
  user,
  organizationId,
  organizationSlug,
  eventId,
  eventSlug,
}: Props) => {
  const dashboardPath = getOrganizationPath(organizationSlug);
  const eventQuery = useEventQuery(user, organizationId, eventId);
  const accessQuery = useEventAccessQuery(user, organizationId, eventId);

  const refreshAccess = async () => {
    const result = await accessQuery.refetch();

    if (result.error) {
      throw result.error;
    }

    if (!result.data || !hasActiveEventAccess(result.data, user.uid)) {
      throw new Error('Active event access is required.');
    }
  };

  const reloadEvent = async () => {
    const result = await eventQuery.refetch();

    if (result.error) throw result.error;
    if (!result.data) throw new Error('The event was unavailable');

    return result.data;
  };

  const error = accessQuery.error ?? eventQuery.error;

  if (error) {
    const problem = getEventAccessProblem(error);

    return (
      <EventAccessDenied
        key={problem.kind}
        title={problem.title}
        description={problem.description}
        backTo={dashboardPath}
        onRefresh={async () => {
          const results = await Promise.all([
            eventQuery.refetch(),
            accessQuery.refetch(),
          ]);

          const failed = results.find((result) => result.error);

          if (failed?.error) throw failed.error;
        }}
      />
    );
  }

  const event = eventQuery.data;
  const access = accessQuery.data;

  if (!event || !access) {
    return <p role="status">Loading event workspace…</p>;
  }

  if (!accessQuery.isFetchedAfterMount) {
    return <p role="status">Checking current event access…</p>;
  }

  if (!hasActiveEventAccess(access, user.uid)) {
    return (
      <EventAccessDenied
        backTo={dashboardPath}
        onRefresh={refreshAccess}
        title="Event membership required"
        description="You must have active membership in both this organization and this event."
      />
    );
  }

  if (event.slug !== eventSlug) {
    return (
      <InlineAlert tone="error" title="Event link unavailable">
        Return to the organization dashboard and open the event again.
      </InlineAlert>
    );
  }

  const accessReady =
    accessQuery.isFetchedAfterMount &&
    !accessQuery.isFetching &&
    !accessQuery.error;

  const capabilities = getEffectiveEventCapabilities(
    access,
    user.uid,
    event.status,
    accessReady,
  );

  const sections = Object.values(EVENT_SECTIONS).filter((section) =>
    hasEventPermission(access, section.permission),
  );

  return (
    <EventWorkspaceContext.Provider
      value={{
        user,
        organizationId,
        organizationSlug,
        event,
        access,
        capabilities,
        accessReady,
        refreshAccess,
        reloadEvent,
      }}
    >
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">{event.name}</h1>
          <p className="text-sm text-muted-foreground">{event.status}</p>
        </header>

        {error && (
          <InlineAlert tone="warning">
            The latest refresh failed. Refresh access before making changes.
          </InlineAlert>
        )}

        <nav
          aria-label="Event navigation"
          className="flex flex-wrap gap-3 border-b pb-3"
        >
          {sections.map((section) => (
            <NavLink
              key={section.segment}
              end={section.segment === ''}
              to={getEventWorkspacePath(
                organizationSlug,
                eventSlug,
                section.segment,
              )}
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-2 focus-visible:outline-2',
                  isActive
                    ? 'bg-primary/10 font-medium'
                    : 'text-muted-foreground',
                ].join(' ')
              }
            >
              {section.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </EventWorkspaceContext.Provider>
  );
};

type LookupProps = {
  user: User;
  organizationId: string;
  organizationSlug: string;
  eventSlug: string;
};

const EventSlugLookup = (props: LookupProps) => {
  const query = useQuery({
    queryKey: [
      'account',
      props.user.uid,
      'organization',
      props.organizationId,
      'event-by-slug',
      props.eventSlug,
    ],
    queryFn: ({ signal }) =>
      findEventBySlug(
        props.user,
        props.organizationId,
        props.eventSlug,
        signal,
      ),
    staleTime: 0,
  });

  const error = query.error ? getEventAccessProblem(query.error) : null;

  const dashboardPath = getOrganizationPath(props.organizationSlug);

  if (error) {
    return (
      <EventAccessDenied
        key={error.kind}
        title={error.title}
        description={error.description}
        backTo={dashboardPath}
        onRefresh={async () => {
          const result = await query.refetch();

          if (result.error) throw result.error;
        }}
      />
    );
  }

  if (!query.data) {
    return <p role="status">Finding event…</p>;
  }

  return (
    <EventWorkspaceLoader
      key={`${props.user.uid}:${props.organizationId}:${query.data.id}`}
      user={props.user}
      organizationId={props.organizationId}
      organizationSlug={props.organizationSlug}
      eventId={query.data.id}
      eventSlug={props.eventSlug}
    />
  );
};

export const EventShell = () => {
  const session = useAuth();
  const organization = useActiveOrganization();
  const { eventSlug } = useParams<{ eventSlug: string }>();

  if (session.status !== 'authenticated') return null;

  if (
    !eventSlug ||
    eventSlug.length < 3 ||
    eventSlug.length > 63 ||
    !SLUG_PATTERN.test(eventSlug)
  ) {
    return (
      <InlineAlert tone="error" title="Invalid event link">
        Open the event from the organization dashboard.
      </InlineAlert>
    );
  }

  return (
    <EventSlugLookup
      key={`${session.user.uid}:${organization.id}:${eventSlug}`}
      user={session.user}
      organizationId={organization.id}
      organizationSlug={organization.slug}
      eventSlug={eventSlug}
    />
  );
};
