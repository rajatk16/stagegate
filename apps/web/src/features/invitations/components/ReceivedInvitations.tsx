import { Link } from 'react-router';
import type { User } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge, Button, InlineAlert } from '@/components';
import { useOrganizations } from '@/features/organizations';
import { ApiError, getOrganizationPath, clearInvitationToken } from '@/lib';

import { ReceivedInvitation, ReceivedInvitationsPage } from '../types';
import {
  getAcceptanceProblem,
  listReceivedInvitations,
  acceptReceivedInvitation,
  getReceivedInvitationsError,
} from '../services';

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

  const [state, setState] = useState<State>({ status: 'loading' });
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'info' | 'error';
    message: string;
  } | null>(null);

  const readRequest = useRef<AbortController | null>(null);
  const writeRequest = useRef<AbortController | null>(null);
  const refreshButton = useRef<HTMLButtonElement>(null);

  const load = useCallback(
    async (cursor: string | null = null, showLoading = true) => {
      readRequest.current?.abort();

      const controller = new AbortController();
      readRequest.current = controller;

      if (showLoading) {
        setState({ status: 'loading' });
      }

      try {
        const page = await listReceivedInvitations(
          user,
          controller.signal,
          cursor,
        );

        if (!controller.signal.aborted) {
          setState({ status: 'ready', page });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: getReceivedInvitationsError(error),
          });
        }
      } finally {
        if (readRequest.current === controller) {
          readRequest.current = null;
        }
      }
    },
    [user],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load(null, false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      readRequest.current?.abort();
      writeRequest.current?.abort();
    };
  }, [load]);

  const accept = async (invitation: ReceivedInvitation) => {
    if (
      writeRequest.current !== null ||
      readRequest.current !== null ||
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
      const result = await acceptReceivedInvitation(
        user,
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

      reloadOrganizations();
      void load();
      refreshButton.current?.focus();
    } catch (error: unknown) {
      if (controller.signal.aborted) return;

      const problem = getAcceptanceProblem(error);

      setFeedback({
        tone: problem.kind === 'already-member' ? 'info' : 'error',
        message: problem.message,
      });

      if (problem.kind === 'already-member') {
        setJoinedId(invitation.organizationId);
        reloadOrganizations();
        void load();
      } else if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        // Do not retain recipient data after an authorization failure.
        setState({
          status: 'error',
          message: getReceivedInvitationsError(error),
        });
      } else if (problem.kind === 'unavailable') {
        void load();
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

  const busy = acceptingId !== null;

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
          aria-disabled={busy || state.status === 'loading'}
          onClick={() => {
            if (!busy && state.status !== 'loading') void load();
          }}
        >
          Refresh invitations
        </Button>
      </div>

      {feedback && (
        <InlineAlert tone={feedback.tone}>{feedback.message}</InlineAlert>
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
                onClick={reloadOrganizations}
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
              {state.page.nextCursor === null
                ? 'No pending invitations on this page.'
                : 'No invitations to show on this page. Check the next page.'}
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
              disabled={busy || state.page.nextCursor === null}
              onClick={() => void load(state.page.nextCursor)}
            >
              Next page
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
