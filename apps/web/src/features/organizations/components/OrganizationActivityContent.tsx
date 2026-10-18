import { User } from 'firebase/auth';
import { Organization, OrganizationActivityEvent } from '../types';
import { useOrganizations } from '../hooks';
import { useLocation } from 'react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { isRecord } from '@/app/utils';
import { listOrganizationActivity } from '../services/activity';
import { ApiError } from '@/lib';
import { getActivityError, getActivityLabel } from '../utils';
import { Button, InlineAlert } from '@/components';

type State = {
  items: OrganizationActivityEvent[];
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

export const ActivityContent = ({
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

  const transferred =
    isRecord(navigationState) &&
    isRecord(navigationState.ownershipTransferred) &&
    navigationState.ownershipTransferred.organizationId === organization.id &&
    navigationState.ownershipTransferred.uid === user.uid;

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
        const page = await listOrganizationActivity(
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
          throw new ApiError(
            'The API repeated an activity cursor.',
            'response',
          );
        }

        if (page.nextCursor !== null) {
          seenCursors.current.add(page.nextCursor);
        }

        setState((current) => {
          const byId = new Map(
            (append ? current.items : []).map((event) => [
              event.eventId,
              event,
            ]),
          );

          for (const event of page.items) {
            byId.set(event.eventId, event);
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
          error: getActivityError(error),
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
      aria-labelledby="organization-activity-heading"
      className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2
            id="organization-activity-heading"
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold"
          >
            Organization activity
          </h2>

          <p className="text-sm text-muted-foreground">
            Recorded successful changes, newest first. Refresh to see recent
            activity.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={state.loading}
          onClick={() => void load(null)}
        >
          Refresh activity
        </Button>
      </div>

      {transferred && (
        <InlineAlert tone="success" title="Ownership transferred">
          The selected member is now an owner. Your role changed to Admin.
        </InlineAlert>
      )}

      {state.error !== null && (
        <div className="space-y-3">
          <InlineAlert tone="error" title="Could not load activity">
            {state.error}
            {state.restartRequired && (
              <p className="mt-2">Refresh activity to restart pagination.</p>
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
        <ol className="divide-y rounded-xl border">
          {state.items.map((event) => {
            const actor =
              event.actorDisplayName ??
              event.actorEmail ??
              'Member details unavailable';

            return (
              <li key={event.eventId} className="space-y-2 p-4 sm:p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-medium">{getActivityLabel(event)}</p>

                  <time
                    dateTime={event.occurredAt}
                    className="text-sm text-muted-foreground"
                  >
                    {dateFormatter.format(new Date(event.occurredAt))}
                  </time>
                </div>

                <p className="wrap-break-word text-sm">
                  {actor}
                  {event.actorUid === user.uid && ' (you)'}
                </p>

                {event.actorDisplayName && event.actorEmail && (
                  <p className="break-all text-sm text-muted-foreground">
                    {event.actorEmail}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}

      {!state.loading && state.error === null && state.items.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <p className="font-medium">No activity recorded yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Supported organization changes will appear here.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {state.loading
            ? 'Loading activity…'
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
