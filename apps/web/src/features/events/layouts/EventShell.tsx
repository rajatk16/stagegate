import type { User } from 'firebase/auth';
import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet, useParams } from 'react-router';

import { useAuth } from '@/features/auth';
import { getEventWorkspacePath } from '@/lib';
import { Button, InlineAlert } from '@/components';
import { useActiveOrganization } from '@/features/organizations';
import { isAccessError, useEventAccessQuery, useEventQuery } from '@/app/query';

import { findEventBySlug } from '../services';
import { hasActiveEventAccess, hasEventPermission } from '../utils';
import { EVENT_SLUG_PATTERN } from '../constants';
import { EventWorkspaceContext } from '../context';

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

  const retry = () => {
    void Promise.all([eventQuery.refetch(), accessQuery.refetch()]);
  };

  const error = accessQuery.error ?? eventQuery.error;
  const accessLost =
    isAccessError(accessQuery.error) || isAccessError(eventQuery.error);

  if (accessLost || ((!accessQuery.data || !eventQuery.data) && error)) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Event unavailable">
          This event could not be loaded or your access has changed.
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          disabled={accessQuery.isFetching || eventQuery.isFetching}
          onClick={retry}
        >
          Refresh event access
        </Button>
      </div>
    );
  }

  const event = eventQuery.data;
  const access = accessQuery.data;

  if (!event || !access) {
    return <p role="status">Loading event workspace…</p>;
  }

  if (!hasActiveEventAccess(access, user.uid)) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="warning" title="Event membership required">
          You need an active event assignment or organization administrator
          access to open this event.
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          disabled={accessQuery.isFetching}
          onClick={() => {
            void accessQuery.refetch();
          }}
        >
          Refresh event membership
        </Button>
      </div>
    );
  }

  if (event.slug !== eventSlug) {
    return (
      <InlineAlert tone="error" title="Event link unavailable">
        Return to the organization dashboard and open the event again.
      </InlineAlert>
    );
  }

  const sections = [
    { segment: '' as const, label: 'Overview', visible: true },
    {
      segment: 'team' as const,
      label: 'Team',
      visible: hasEventPermission(access, 'event:members:read'),
    },
    {
      segment: 'settings' as const,
      label: 'Settings',
      visible: hasEventPermission(access, 'event:update'),
    },
  ];

  return (
    <EventWorkspaceContext.Provider
      value={{
        user,
        organizationId,
        organizationSlug,
        event,
        access,
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
          {sections
            .filter((section) => section.visible)
            .map((section) => (
              <NavLink
                key={section.segment}
                end
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

  if (query.error) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error" title="Event unavailable">
          This event could not be found or loaded.
        </InlineAlert>

        <Button
          type="button"
          variant="outline"
          disabled={query.isFetching}
          onClick={() => {
            void query.refetch();
          }}
        >
          Try again
        </Button>
      </div>
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
    !EVENT_SLUG_PATTERN.test(eventSlug)
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
