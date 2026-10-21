import { User } from 'firebase/auth';
import { Link, useLocation } from 'react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { isRecord } from '@/app/utils';
import { Badge, Button, InlineAlert } from '@/components';
import { ApiError, getOrganizationSectionPath } from '@/lib';

import { useOrganizations } from '../hooks';
import { listOrganizationEvents } from '../services';
import { Organization, OrganizationEvent } from '../types';
import { getEventsError, hasOrganizationCapability } from '../utils';

type State = {
  items: OrganizationEvent[];
  nextCursor: string | null;
  loading: boolean;
  error: string | null;
  accessChanged: boolean;
  restartRequired: boolean;
};

const initialState: State = {
  items: [],
  nextCursor: null,
  loading: true,
  error: null,
  accessChanged: false,
  restartRequired: false,
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const OrganizationEventsContent = ({
  user,
  organization,
}: {
  user: User;
  organization: Organization;
}) => {
  const { reload } = useOrganizations();
  const location = useLocation();
  const navigationState: unknown = location.state;

  const [state, setState] = useState<State>(initialState);
  const requestRef = useRef<AbortController | null>(null);
  const seenCursors = useRef(new Set<string>());
  const headingRef = useRef<HTMLHeadingElement>(null);

  const createdEventName =
    isRecord(navigationState) &&
    isRecord(navigationState.createdEvent) &&
    navigationState.createdEvent.organizationid === organization.id &&
    navigationState.createdEvent.uid === user.uid &&
    typeof navigationState.createdEvent.name === 'string'
      ? navigationState.createdEvent.name
      : null;

  const canCreate = hasOrganizationCapability(
    organization,
    'organization:events.create',
  );

  const createPath = getOrganizationSectionPath(
    organization.slug,
    'events/new',
  );

  const load = useCallback(
    async (cursor: string | null) => {
      const append = cursor !== null;

      if (append && requestRef.current !== null) {
        return;
      }

      requestRef.current?.abort();

      const controller = new AbortController();
      requestRef.current = controller;

      if (!append) {
        seenCursors.current.clear();
      }

      setState((current) =>
        append
          ? { ...current, loading: true, error: null }
          : { ...initialState },
      );

      try {
        const page = await listOrganizationEvents(
          user,
          organization.id,
          controller.signal,
          cursor,
        );

        if (controller.signal.aborted) return;

        if (
          page.nextCursor !== null &&
          seenCursors.current.has(page.nextCursor)
        ) {
          throw new ApiError('The Api repeated an event cursor.', 'response');
        }

        if (page.nextCursor !== null) {
          seenCursors.current.add(page.nextCursor);
        }

        setState((current) => {
          const byId = new Map(
            (append ? current.items : []).map((event) => [event.id, event]),
          );

          for (const event of page.items) {
            byId.set(event.id, event);
          }

          return {
            items: [...byId.values()],
            nextCursor: page.nextCursor,
            loading: false,
            error: null,
            accessChanged: false,
            restartRequired: false,
          };
        });
      } catch (error: unknown) {
        if (controller.signal.aborted) return;

        const accessChanged =
          error instanceof ApiError &&
          (error.status === 401 ||
            error.status === 403 ||
            error.status === 404);

        const restartRequired =
          error instanceof ApiError &&
          (error.status === 400 || error.kind === 'response');

        setState((current) => ({
          ...current,
          items: accessChanged ? [] : current.items,
          nextCursor: accessChanged ? null : current.nextCursor,
          loading: false,
          error: getEventsError(error),
          accessChanged,
          restartRequired,
        }));
      } finally {
        if (requestRef.current === controller) {
          requestRef.current = null;
        }
      }
    },
    [user, organization.id],
  );

  useEffect(() => {
    headingRef.current?.focus();

    const timer = window.setTimeout(() => {
      void load(null);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      requestRef.current?.abort();
    };
  }, [load]);

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
            Events belongs to {organization.name}, newest first.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={state.loading}
            onClick={() => void load(null)}
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

                  <Badge variant="secondary">Draft</Badge>
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

        {state.nextCursor !== null && !state.accessChanged && (
          <Button
            type="button"
            variant="outline"
            disabled={state.loading || state.restartRequired}
            onClick={() => void load(state.nextCursor)}
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
