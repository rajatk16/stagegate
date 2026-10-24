import { User } from 'firebase/auth';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

import { isRecord } from '@/app/utils';
import { Badge, Button, InlineAlert } from '@/components';
import { ApiError, getOrganizationSectionPath } from '@/lib';
import {
  Organization,
  useOrganizations,
  hasOrganizationCapability,
} from '@/features/organizations';
import {
  queryKeys,
  isAccessError,
  useEventsQuery,
  hasRepeatedCursor,
} from '@/app/query';

import { getEventsError } from '../utils/eventUtils';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const EventsContent = ({
  user,
  organization,
}: {
  user: User;
  organization: Organization;
}) => {
  const client = useQueryClient();
  const query = useEventsQuery(user, organization.id);

  const key = queryKeys.resources(user.uid, organization.id, 'events');
  const accessChanged = isAccessError(query.error);
  const repeatedCursor = hasRepeatedCursor(query.data);
  const { reload } = useOrganizations();
  const location = useLocation();
  const navigationState: unknown = location.state;

  const headingRef = useRef<HTMLHeadingElement>(null);

  const items = accessChanged
    ? []
    : [
        ...new Map(
          (query.data?.pages.flatMap((page) => page.items) ?? []).map(
            (event) => [event.id, event],
          ),
        ).values(),
      ];

  const state = {
    items,
    loading: query.isPending || query.isFetchingNextPage,
    error: query.error
      ? getEventsError(query.error)
      : repeatedCursor
        ? 'The server repeated a page cursor. Refresh events.'
        : null,
    accessChanged,
    restartRequired:
      repeatedCursor ||
      (query.error instanceof ApiError &&
        (query.error.status === 400 || query.error.kind === 'response')),
  };

  const refresh = () => {
    void client.resetQueries({
      queryKey: key,
      exact: true,
    });
  };

  const loadMore = () => {
    if (
      query.hasNextPage &&
      !query.isFetching &&
      !state.restartRequired &&
      !state.accessChanged
    ) {
      void query.fetchNextPage({ cancelRefetch: false });
    }
  };

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const createdEventName =
    isRecord(navigationState) &&
    isRecord(navigationState.createdEvent) &&
    navigationState.createdEvent.organizationId === organization.id &&
    navigationState.createdEvent.uid === user.uid &&
    typeof navigationState.createdEvent.name === 'string'
      ? navigationState.createdEvent.name
      : null;

  const canCreate = hasOrganizationCapability(
    organization,
    'organization:events:create',
  );

  const canUpdate =
    hasOrganizationCapability(organization, 'organization:events:read') &&
    hasOrganizationCapability(organization, 'organization:events:update');

  const createPath = getOrganizationSectionPath(
    organization.slug,
    'events/new',
  );

  return (
    <section
      aria-labelledby="organization-events-heading"
      className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2
            id="organization-events-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold"
          >
            Events
          </h2>

          <p className="text-sm text-muted-foreground">
            Events belong to {organization.name}, newest first.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetching}
            onClick={refresh}
          >
            Refresh events
          </Button>

          {canCreate && (
            <Button asChild>
              <Link to={createPath}>Create event</Link>
            </Button>
          )}
        </div>
      </div>

      {createdEventName !== null && (
        <InlineAlert tone="success" title="Draft event created">
          {createdEventName} was created successfully.
        </InlineAlert>
      )}

      {state.error !== null && (
        <div className="space-y-3">
          <InlineAlert tone="error" title="Could not load events">
            {state.error}
            {state.restartRequired && (
              <p className="mt-2">Refresh events to restart pagination.</p>
            )}
          </InlineAlert>

          {state.accessChanged && (
            <Button type="button" variant="outline" onClick={reload}>
              Refresh access
            </Button>
          )}
        </div>
      )}

      {state.items.length > 0 && (
        <ol className="grid gap-4 md:grid-cols-2">
          {state.items.map((event) => (
            <li key={event.id}>
              <article className="h-full space-y-4 rounded-xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 wrap-break-word text-lg font-semibold">
                    {event.name}
                  </h3>

                  <Badge variant="secondary">
                    {event.status === 'DRAFT'
                      ? 'Draft'
                      : event.status === 'PUBLISHED'
                        ? 'Published'
                        : 'Archived'}
                  </Badge>
                </div>

                <p className="break-all text-sm text-muted-foreground">
                  {event.slug}
                </p>
                <p className="text-sm text-muted-foreground">
                  Created{' '}
                  <time dateTime={event.createdAt}>
                    {dateFormatter.format(new Date(event.createdAt))}
                  </time>
                </p>

                {canUpdate && (
                  <Button asChild variant="outline">
                    <Link
                      to={getOrganizationSectionPath(
                        organization.slug,
                        `events/${encodeURIComponent(event.id)}/settings`,
                      )}
                    >
                      Event settings
                    </Link>
                  </Button>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}

      {!state.loading && state.error === null && state.items.length === 0 && (
        <div className="space-y-3 rounded-xl border-dashed p-8 text-center">
          <h3 className="font-medium">No events yet.</h3>
          <p className="text-sm text-muted-foreground">
            {canCreate
              ? 'Create the first event for your organization'
              : 'An owner or admin can create the first event.'}
          </p>

          {canCreate && (
            <Button asChild>
              <Link to={createPath}>Create your first event</Link>
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {state.loading
            ? 'Loading events'
            : `${state.items.length} events shown.`}
        </p>

        {query.hasNextPage && !state.accessChanged && (
          <Button
            type="button"
            variant="outline"
            disabled={query.isFetching || state.restartRequired}
            onClick={loadMore}
          >
            {state.loading
              ? 'Loading…'
              : state.error
                ? 'Retry loading more'
                : 'Load more'}
          </Button>
        )}
      </div>
    </section>
  );
};
