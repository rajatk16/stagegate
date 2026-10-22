import { User } from 'firebase/auth';
import {
  createOrganizationInvitation,
  revokeOrganizationInvitation,
} from '../services';
import { useOrganizations } from '../hooks';
import { useEffect, useRef, useState } from 'react';
import { INVITATION_ROLES, Organization } from '../types';
import { useOrganizationInvitation } from '../hooks/useOrganizationInvitation';
import { getInvitationErrorMessage, isInvitationRole } from '../utils';
import { ApiError } from '@/lib';
import {
  Badge,
  Button,
  ConfirmDialog,
  InlineAlert,
  InputField,
  SelectField,
} from '@/components';
import { queryKeys, useApiMutation } from '@/app/query';

type Props = {
  user: User;
  organization: Organization;
};

const roleLabels: Record<INVITATION_ROLES, string> = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
  VIEWER: 'Viewer',
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export const OrganizationInvitations = (props: Props) => {
  const { reload } = useOrganizations();
  const {
    state,
    refresh,
    nextPage,
    invalidate,
    pageError,
    fetching,
    restartRequired,
  } = useOrganizationInvitation(props.user, props.organization.id);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<INVITATION_ROLES>(INVITATION_ROLES.MEMBER);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);

  const affected = [
    queryKeys.organizations(props.user.uid),
    queryKeys.resources(props.user.uid, props.organization.id, 'invitations'),
    queryKeys.resources(props.user.uid, props.organization.id, 'activity'),
  ];

  const createMutation = useApiMutation({
    user: props.user,
    request: createOrganizationInvitation,
    affected,
  });

  const revokeMutation = useApiMutation({
    user: props.user,
    request: revokeOrganizationInvitation,
    affected,
  });

  const writeRequest = useRef<AbortController | null>(null);
  const refreshButton = useRef<HTMLButtonElement>(null);

  useEffect(
    () => () => {
      writeRequest.current?.abort();
    },
    [],
  );

  const allowedRoles = state.status === 'ready' ? state.page.allowedRoles : [];

  const selectedRole = allowedRoles.includes(role) ? role : allowedRoles[0];

  const runAction = async (
    action: (signal: AbortSignal) => Promise<string>,
  ): Promise<boolean> => {
    if (writeRequest.current !== null || state.status !== 'ready') {
      return false;
    }

    const controller = new AbortController();
    writeRequest.current = controller;

    setBusy(true);
    setFeedback(null);

    try {
      const message = await action(controller.signal);

      if (controller.signal.aborted) return false;

      setFeedback({ tone: 'success', message });
      refreshButton.current?.focus();

      return true;
    } catch (error: unknown) {
      if (controller.signal.aborted) return false;

      const message = getInvitationErrorMessage(error, 'write');
      setFeedback({ tone: 'error', message });

      if (
        error instanceof ApiError &&
        (error.status === 401 ||
          (error.status === 403 && error.code !== 'AUTH_EMAIL_NOT_VERIFIED'))
      ) {
        invalidate(message);
        refreshButton.current?.focus();
      }

      return false;
    } finally {
      if (writeRequest.current === controller) {
        writeRequest.current = null;
      }

      if (!controller.signal.aborted) {
        setBusy(false);
      }
    }
  };

  const sendInvitation = async () => {
    if (selectedRole === undefined) return;

    const succeeded = await runAction(async (signal) => {
      const emailStatus = await createMutation.execute(
        props.organization.id,
        { email, role: selectedRole },
        signal,
      );

      return emailStatus === 'CAPTURED'
        ? 'Invitation created. The email was captured by the development email provider.'
        : 'Invitation created. The email provider accepted the message for delivery.';
    });

    if (succeeded) {
      setEmail('');
    }
  };

  return (
    <section
      aria-labelledby="organization-invitations-heading"
      className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h2
            id="organization-invitations-heading"
            className="text-xl font-semibold"
          >
            Invitations
          </h2>

          <p className="text-sm leading-6 text-muted-foreground">
            Invite people to {props.organization.name} and manage invitations
            awaiting acceptance.
          </p>
        </div>

        <Button
          ref={refreshButton}
          type="button"
          variant="outline"
          aria-disabled={busy || state.status === 'loading'}
          onClick={() => {
            if (!busy && state.status !== 'loading') refresh();
          }}
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
            <p className="mt-2">Refresh invitaitons to restart pagination</p>
          )}
        </InlineAlert>
      )}

      {!props.user.emailVerified && (
        <InlineAlert tone="warning">
          Verify your email before creating or revoking invitations.
        </InlineAlert>
      )}

      {state.status === 'loading' && (
        <p role="status" className="text-sm text-muted-foreground">
          Loading invitations...
        </p>
      )}

      {state.status === 'error' && (
        <div className="space-y-3">
          <InlineAlert tone="error">{state.message}</InlineAlert>

          <Button
            type="button"
            variant="outline"
            disabled={busy || fetching}
            onClick={reload}
          >
            Refresh access
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <form
            className="space-y-4 rounded-xl border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void sendInvitation();
            }}
          >
            <h3 className="font-semibold">Invite a teammate</h3>

            <fieldset
              disabled={busy || !props.user.emailVerified}
              className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]"
            >
              <legend className="sr-only">Invitation details</legend>

              <InputField
                label="Email address"
                type="email"
                autoComplete="off"
                maxLength={254}
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teammate@example.com"
              />

              <SelectField
                label="Role"
                required
                value={selectedRole ?? ''}
                onChange={(event) => {
                  if (isInvitationRole(event.target.value)) {
                    setRole(event.target.value);
                  }
                }}
              >
                {selectedRole === undefined && (
                  <option value="">No roles available</option>
                )}

                {allowedRoles.map((allowedRole) => (
                  <option key={allowedRole} value={allowedRole}>
                    {roleLabels[allowedRole]}
                  </option>
                ))}
              </SelectField>
            </fieldset>

            <Button
              type="submit"
              disabled={
                busy || !props.user.emailVerified || selectedRole === undefined
              }
            >
              {busy ? 'Working…' : 'Send invitation'}
            </Button>
          </form>

          <div className="space-y-4">
            <h3 className="font-semibold">Pending invitations</h3>

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
                      <p className="break-all font-medium">
                        {invitation.recipientEmail}
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                          {roleLabels[invitation.role]}
                        </Badge>
                        <Badge variant="secondary">Awaiting acceptance</Badge>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Expires{' '}
                        <time dateTime={invitation.expiresAt}>
                          {dateFormatter.format(new Date(invitation.expiresAt))}
                        </time>
                      </p>
                    </div>

                    {invitation.canRevoke && (
                      <ConfirmDialog
                        triggerLabel="Revoke"
                        title="Revoke invitation?"
                        description={
                          `Revoke the invitation for ${invitation.recipientEmail}? ` +
                          'Its link will no longer allow them to join.'
                        }
                        confirmLabel="Revoke invitation"
                        pendingLabel="Revoking…"
                        destructive
                        disabled={busy || !props.user.emailVerified}
                        errorMessage="Revocation could not be confirmed. Close this dialog and check the message above the list."
                        restoreFocus={() => refreshButton.current?.focus()}
                        onConfirm={async () => {
                          const succeeded = await runAction(async (signal) => {
                            await revokeMutation.execute(
                              props.organization.id,
                              invitation.id,
                              signal,
                            );

                            return `Invitation for ${invitation.recipientEmail} revoked.`;
                          });

                          if (!succeeded) {
                            throw new Error('REVOCATION_UNCONFIRMED');
                          }
                        }}
                      />
                    )}
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
                  busy ||
                  fetching ||
                  restartRequired ||
                  state.page.nextCursor === null
                }
                onClick={nextPage}
              >
                {fetching ? 'Loadding...' : 'Load more'}
              </Button>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              This list reflects the last refresh. Refresh invitations to check
              for acceptance, revocation, or expiry.
            </p>
          </div>
        </>
      )}
    </section>
  );
};
