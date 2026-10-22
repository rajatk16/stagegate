import { Link } from 'react-router';
import type { User } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';

import { Badge, Button, InlineAlert } from '@/components';
import { useOrganizations } from '@/features/organizations';
import { ApiError, getOrganizationPath, clearInvitationToken } from '@/lib';

import { ReceivedInvitation, ReceivedInvitationsPage } from '../types';
import {
  getAcceptanceProblem,
  acceptReceivedInvitation,
  getReceivedInvitationsError,
} from '../services';
import { useQueryClient } from '@tanstack/react-query';
import {
  hasRepeatedCursor,
  isAccessError,
  queryKeys,
  useApiMutation,
  useReceivedInvitationsQuery,
} from '@/app/query';

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; page: ReceivedInvitationsPage };

const roleLabels = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const ReceivedInvitations = ({ user }: { user: User }) => {
  const { state: organizationsState, reload: reloadOrganizations } =
    useOrganizations();

  const client = useQueryClient();
  const query = useReceivedInvitationsQuery(user);

  const key = queryKeys.receivedInvitations(user.uid, user.email);

  const acceptMutation = useApiMutation({
    user,
    request: acceptReceivedInvitation,
    affected: [queryKeys.account(user.uid)],
  });

  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const writeRequest = useRef<AbortController | null>(null);
  const refreshButton = useRef<HTMLButtonElement>(null);

  const accessChanged = isAccessError(query.error);
  const repeatedCursor = hasRepeatedCursor(query.data);

  const restartRequired =
    repeatedCursor ||
    (query.error instanceof ApiError &&
      (query.error.status === 400 || query.error.kind === 'response'));

  const pageError = query.error
    ? getReceivedInvitationsError(query.error)
    : repeatedCursor
      ? 'The server repeated a page cursor. Refresh invitations.'
      : null;

  const lastPage = query.data?.pages.at(-1);
  let state: State;

  if (blockedMessage !== null) {
    state = { status: 'error', message: blockedMessage };
  } else if (accessChanged || (query.isError && lastPage === undefined)) {
    state = {
      status: 'error',
      message: pageError ?? 'Could not load invitations.',
    };
  } else if (lastPage !== undefined) {
    state = {
      status: 'ready',
      page: {
        items: [
          ...new Map(
            query
              .data!.pages.flatMap((page) => page.items)
              .map((invitation) => [invitation.id, invitation]),
          ).values(),
        ],
        nextCursor: query.hasNextPage ? lastPage.nextCursor : null,
      },
    };
  } else {
    state = { status: 'loading' };
  }

  const load = (cursor: string | null = null) => {
    if (query.isFetching || writeRequest.current !== null) return;

    if (cursor === null) {
      setBlockedMessage(null);
      void client.resetQueries({ queryKey: key, exact: true });
      return;
    }

    if (
      query.hasNextPage &&
      !accessChanged &&
      !restartRequired &&
      blockedMessage === null
    ) {
      void query.fetchNextPage({ cancelRefetch: false });
    }
  };

  useEffect(
    () => () => {
      writeRequest.current?.abort();
    },
    [],
  );

  const accept = async (invitation: ReceivedInvitation) => {
    if (
      writeRequest.current !== null ||
      query.isFetching ||
      state.status !== 'ready'
    ) {
      return;
    }

    const controller = new AbortController();
    writeRequest.current = controller;

    setAcceptingId(invitation.id);
    setFeedback(null);
    setJoinedId(null);

    try {
      const result = await acceptMutation.execute(
        invitation,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      clearInvitationToken(invitation.id);
      setJoinedId(result.organizationId);
      setFeedback({
        tone: 'success',
        message: result.alreadyAccepted
          ? `You have already accepted the invitation to ${invitation.organizationName}.`
          : `You have joined ${invitation.organizationName}.`,
      });

      refreshButton.current?.focus();
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      const problem = getAcceptanceProblem(error);

      setFeedback({
        tone: problem.kind === 'already-member' ? 'info' : 'error',
        message: problem.message,
      });

      if (problem.kind === 'already-member') {
        clearInvitationToken(invitation.id);
        setJoinedId(invitation.organizationId);
      } else if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        setBlockedMessage(getReceivedInvitationsError(error));
      }

      refreshButton.current?.focus();
    } finally {
      if (writeRequest.current === controller) {
        writeRequest.current = null;
      }

      if (!controller.signal.aborted) {
        setAcceptingId(null);
      }
    }
  };

  const joinedOrganization =
    organizationsState.status === 'ready'
      ? organizationsState.organizations.find(
          (organization) => organization.id === joinedId,
        )
      : undefined;

  const busy = acceptingId !== null || query.isFetching;

  return (
    <section
      aria-labelledby="received-invitations-heading"
      className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2
            id="received-invitations-heading"
            className="text-xl font-semibold"
          >
            Received invitations
          </h2>

          <p className="text-sm text-muted-foreground">
            Pending organization invitations sent to your verified email
            address.
          </p>
        </div>

        <Button
          ref={refreshButton}
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => reloadOrganizations()}
        >
          Refresh invitations
        </Button>
      </div>

      {feedback && (
        <InlineAlert tone={feedback.tone}>{feedback.message}</InlineAlert>
      )}

      {state.status === 'ready' && pageError && (
        <InlineAlert tone="error">
          {pageError}
          {restartRequired && (
            <p className="mt-2">Refresh invitations to restart pagination.</p>
          )}
        </InlineAlert>
      )}

      {joinedId !== null && (
        <div className="space-y-3">
          {joinedOrganization ? (
            <Button asChild>
              <Link to={getOrganizationPath(joinedOrganization.slug)}>
                Open {joinedOrganization.name}
              </Link>
            </Button>
          ) : organizationsState.status === 'loading' ? (
            <p role="status" className="text-sm text-muted-foreground">
              Refreshing your organizations…
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Your membership is confirmed. Refresh your organizations if it
                has not appeared yet.
              </p>

              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => load()}
              >
                Refresh organizations
              </Button>
            </>
          )}
        </div>
      )}

      {state.status === 'loading' && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading invitations…
        </p>
      )}

      {state.status === 'error' && (
        <InlineAlert tone="error">{state.message}</InlineAlert>
      )}

      {state.status === 'ready' && (
        <>
          {state.page.items.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No pending invitations.
            </p>
          ) : (
            <ul className="divide-y rounded-xl border">
              {state.page.items.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-2">
                    <h3 className="wrap-break-word font-semibold">
                      {invitation.organizationName}
                    </h3>

                    <Badge variant="outline">
                      {roleLabels[invitation.role as keyof typeof roleLabels]}
                    </Badge>

                    <p className="text-sm text-muted-foreground">
                      Expires{' '}
                      <time dateTime={invitation.expiresAt}>
                        {dateFormatter.format(new Date(invitation.expiresAt))}
                      </time>
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={busy}
                    aria-label={`Accept invitation to ${invitation.organizationName}`}
                    onClick={() => void accept(invitation)}
                  >
                    {acceptingId === invitation.id
                      ? 'Accepting…'
                      : 'Accept invitation'}
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-4">
            <p role="status" className="text-sm text-muted-foreground">
              {state.page.items.length} invitations shown.
            </p>

            <Button
              type="button"
              variant="outline"
              disabled={
                busy || restartRequired || state.page.nextCursor === null
              }
              onClick={() => load(state.page.nextCursor)}
            >
              {query.isFetching ? 'Loading…' : 'Load more'}
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
