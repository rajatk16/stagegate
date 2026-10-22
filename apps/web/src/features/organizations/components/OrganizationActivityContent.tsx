import { User } from 'firebase/auth';
import { Organization } from '../types';
import { useOrganizations } from '../hooks';
import { useLocation } from 'react-router';
import { useEffect, useRef } from 'react';
import { isRecord } from '@/app/utils';
import { ApiError } from '@/lib';
import { getActivityError, getActivityLabel } from '../utils';
import { Button, InlineAlert } from '@/components';
import { useQueryClient } from '@tanstack/react-query';
import {
  hasRepeatedCursor,
  isAccessError,
  queryKeys,
  useActivityQuery,
} from '@/app/query';

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
  const client = useQueryClient();
  const query = useActivityQuery(user, organization.id);
  const { reload } = useOrganizations();

  const location = useLocation();
  const navigationState: unknown = location.state;
  const headingRef = useRef<HTMLHeadingElement>(null);

  const key = queryKeys.resources(user.uid, organization.id, 'activity');

  const accessChanged = isAccessError(query.error);
  const repeatedCursor = hasRepeatedCursor(query.data);

  const restartRequired =
    repeatedCursor ||
    (query.error instanceof ApiError &&
      (query.error.status === 400 || query.error.kind === 'response'));

  const items = accessChanged
    ? []
    : [
        ...new Map(
          (query.data?.pages.flatMap((page) => page.items) ?? []).map(
            (event) => [event.eventId, event],
          ),
        ).values(),
      ];

  const state = {
    items,
    nextCursor: query.hasNextPage
      ? (query.data?.pages.at(-1)?.nextCursor ?? null)
      : null,
    loading: query.isPending || query.isFetching,
    error: query.error
      ? getActivityError(query.error)
      : repeatedCursor
        ? 'The server repeated a page cursor. Refresh activity.'
        : null,
    accessChanged,
    restartRequired,
  };

  const transferred =
    isRecord(navigationState) &&
    isRecord(navigationState.ownershipTransferred) &&
    navigationState.ownershipTransferred.organizationId === organization.id &&
    navigationState.ownershipTransferred.uid === user.uid;

  const load = (cursor: string | null) => {
    if (query.isFetching) return;

    if (cursor === null) {
      void client.resetQueries({
        queryKey: key,
        exact: true,
      });
      return;
    }

    if (query.hasNextPage && !accessChanged && !restartRequired) {
      void query.fetchNextPage({ cancelRefetch: false });
    }
  };

  useEffect(() => {
    headingRef.current?.focus();
  }, []);
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
