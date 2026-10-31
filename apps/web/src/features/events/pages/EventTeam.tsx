import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import {
  Button,
  InputField,
  InlineAlert,
  SelectField,
  SubmitButton,
  ConfirmDialog,
} from '@/components';
import {
  queryKeys,
  isAccessError,
  hasRepeatedCursor,
  useEventMembersQuery,
  useEventInvitationsQuery,
} from '@/app/query';

import { RoleEditor } from '../components';
import { CreateEventInvitationInput } from '../types';
import { useEventTeamWrite, useEventWorkspace } from '../hooks';
import {
  createEventInvitation,
  revokeEventInvitation,
  updateEventMemberStatus,
} from '../services';
import {
  EVENT_ROLE_LABELS,
  hasEventPermission,
  getGrantableEventRoles,
} from '../utils';

export const EventTeam = () => {
  const { user, organizationId, event, access, refreshAccess } =
    useEventWorkspace();

  const client = useQueryClient();
  const write = useEventTeamWrite();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const canRead = hasEventPermission(access, 'event:members:read');
  const canManage = hasEventPermission(access, 'event:members:manage');
  const archived = event.status === 'ARCHIVED';
  const grantable = getGrantableEventRoles(access.authority);

  const membersQuery = useEventMembersQuery(
    user,
    organizationId,
    event.id,
    canRead,
  );

  const invitationsQuery = useEventInvitationsQuery(
    user,
    organizationId,
    event.id,
    canManage,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEventInvitationInput>({
    defaultValues: { email: '', role: 'REVIEWER' },
    mode: 'onBlur',
  });

  const accessError =
    isAccessError(membersQuery.error) ||
    (canManage && isAccessError(invitationsQuery.error));

  const membersRepeated = hasRepeatedCursor(membersQuery.data);
  const invitaitonsRepeated = hasRepeatedCursor(invitationsQuery.data);

  const members = [
    ...new Map(
      (membersQuery.data?.pages.flatMap((page) => page.items) ?? []).map(
        (member) => [member.uid, member],
      ),
    ).values(),
  ];

  const invitations = [
    ...new Map(
      (invitationsQuery.data?.pages.flatMap((page) => page.items) ?? []).map(
        (invitation) => [invitation.id, invitation],
      ),
    ).values(),
  ];

  const busy =
    write.pending ||
    refreshing ||
    membersQuery.isFetching ||
    (canManage && invitationsQuery.isFetching);

  const writesDisabled =
    busy ||
    write.needsRefresh ||
    accessError ||
    !canManage ||
    !!membersQuery.error ||
    (canManage && !!invitationsQuery.error) ||
    membersRepeated ||
    invitaitonsRepeated;

  const refresh = async () => {
    if (write.pending || refreshing) return;

    setRefreshing(true);
    setRefreshError(null);

    try {
      await refreshAccess();

      await client.resetQueries(
        {
          queryKey: queryKeys.eventMembers(user.uid, organizationId, event.id),
          exact: true,
        },
        { throwOnError: true },
      );

      if (canManage) {
        await client.resetQueries(
          {
            queryKey: queryKeys.eventInvitations(
              user.uid,
              organizationId,
              event.id,
            ),
            exact: true,
          },
          { throwOnError: true },
        );
      }
      write.clearAfterRefresh();
    } catch {
      setRefreshError('Could not refresh the team. Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const invite = async (values: CreateEventInvitationInput) => {
    if (writesDisabled || archived || !grantable.includes(values.role)) {
      return;
    }

    const saved = await write.run(async (signal) => {
      const invitation = await createEventInvitation(
        user,
        organizationId,
        event.id,
        values,
        signal,
      );

      return invitation.emailStatus === 'CAPTURED'
        ? 'Invitation created. Email captured by the development provider.'
        : 'Invitaiton created. Email accepted for delivery.';
    });

    if (saved) reset({ email: '', role: 'REVIEWER' });
  };

  if (!canRead) {
    return <InlineAlert tone="warning">Team access unavailable.</InlineAlert>;
  }

  if (accessError) {
    return (
      <div className="space-y-4">
        <InlineAlert tone="error">
          Your event access may have changed.
        </InlineAlert>
        <Button type="button" disabled={busy} onClick={() => void refresh()}>
          Refresh access
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Event team</h2>

        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void refresh()}
        >
          {refreshing ? 'Refreshing…' : 'Refresh team'}
        </Button>
      </div>

      {write.feedback && (
        <InlineAlert tone={write.feedback.tone}>
          {write.feedback.message}
        </InlineAlert>
      )}

      {refreshError && <InlineAlert tone="error">{refreshError}</InlineAlert>}

      {write.needsRefresh && (
        <InlineAlert tone="warning">
          Refresh the team before submitting another change.
        </InlineAlert>
      )}

      {archived && (
        <InlineAlert tone="info">
          This event is archived. Role changes, invitations, and reactivation
          are unavailable.
        </InlineAlert>
      )}

      <section className="space-y-4 rounded-2xl border p-5">
        <h3 className="text-lg font-semibold">Members</h3>

        {membersQuery.isPending && <p role="status">Loading team…</p>}

        {(membersQuery.error || membersRepeated) && (
          <InlineAlert tone="error">
            Could not load the complete team. Refresh team to restart.
          </InlineAlert>
        )}

        {!membersQuery.isPending &&
          !membersQuery.error &&
          members.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No explicit event memberships yet. Organization owners and
              administrators can also manage this event.
            </p>
          )}

        <ul className="divide-y">
          {members.map((member) => {
            const manageable =
              canManage &&
              member.uid !== user.uid &&
              grantable.includes(member.role);

            const nextStatus =
              member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

            return (
              <li key={member.uid} className="space-y-4 py-4">
                <div className="space-y-1">
                  <p className="break-all font-medium">
                    {member.uid}
                    {member.uid === user.uid ? ' (You)' : ''}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {EVENT_ROLE_LABELS[member.role]} · {member.status}
                  </p>
                </div>

                {manageable && (
                  <div className="space-y-3">
                    {member.status === 'ACTIVE' && !archived && (
                      <RoleEditor
                        key={`${member.uid}:${member.role}:${member.updatedAt}`}
                        member={member}
                        disabled={writesDisabled}
                        write={write}
                      />
                    )}

                    {(!archived || nextStatus === 'SUSPENDED') && (
                      <ConfirmDialog
                        triggerLabel={
                          nextStatus === 'SUSPENDED'
                            ? 'Suspend membership'
                            : 'Reactivate membership'
                        }
                        title={
                          nextStatus === 'SUSPENDED'
                            ? 'Suspend this event membership?'
                            : 'Reactivate this event membership?'
                        }
                        description={`Member: ${member.uid}`}
                        confirmLabel={
                          nextStatus === 'SUSPENDED' ? 'Suspend' : 'Reactivate'
                        }
                        destructive={nextStatus === 'SUSPENDED'}
                        disabled={writesDisabled}
                        onConfirm={async () => {
                          const saved = await write.run(async (signal) => {
                            await updateEventMemberStatus(
                              user,
                              organizationId,
                              event.id,
                              member.uid,
                              nextStatus,
                              signal,
                            );
                            return 'Event membership updated.';
                          });

                          if (!saved) {
                            throw new Error('Status update failed.');
                          }
                        }}
                      />
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {membersQuery.hasNextPage && (
          <Button
            type="button"
            variant="outline"
            disabled={busy || membersRepeated || !!membersQuery.error}
            onClick={() => {
              void membersQuery.fetchNextPage({ cancelRefetch: false });
            }}
          >
            Load more members
          </Button>
        )}
      </section>

      {canManage && (
        <>
          <form
            noValidate
            className="space-y-4 rounded-2xl border p-5"
            onSubmit={(submitEvent) => {
              void handleSubmit(invite)(submitEvent);
            }}
          >
            <h3 className="text-lg font-semibold">Invite someone</h3>

            <fieldset
              disabled={writesDisabled || archived || grantable.length === 0}
              className="min-w-0 space-y-4"
            >
              <legend className="sr-only">Event invitation</legend>

              <InputField
                id="event-invitation-email"
                label="Email"
                type="email"
                required
                autoComplete="email"
                error={errors.email?.message}
                {...register('email', {
                  validate: (value) => {
                    const email = value.trim();
                    return (
                      (email.length <= 254 &&
                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
                      'Enter a valid email address.'
                    );
                  },
                })}
              />

              <SelectField
                id="event-invitation-role"
                label="Event role"
                error={errors.role?.message}
                {...register('role', {
                  validate: (value) =>
                    grantable.includes(value) || 'Choose a role you can grant.',
                })}
              >
                {grantable.map((role) => (
                  <option key={role} value={role}>
                    {EVENT_ROLE_LABELS[role]}
                  </option>
                ))}
              </SelectField>

              <SubmitButton
                pending={write.pending}
                pendingLabel="Sending invitation…"
              >
                Send invitation
              </SubmitButton>
            </fieldset>
          </form>

          <section className="space-y-4 rounded-2xl border p-5">
            <h3 className="text-lg font-semibold">Pending invitations</h3>

            {invitationsQuery.isPending && (
              <p role="status">Loading invitations…</p>
            )}

            {(invitationsQuery.error || invitaitonsRepeated) && (
              <InlineAlert tone="error">
                Could not load pending invitations. Refresh team.
              </InlineAlert>
            )}

            {!invitationsQuery.isPending &&
              !invitationsQuery.error &&
              invitations.length === 0 && <p>No pending invitations.</p>}

            <ul className="divide-y">
              {invitations.map((invitation) => (
                <li
                  key={invitation.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="break-all font-medium">
                      {invitation.recipientEmail}
                    </p>
                    <p>{EVENT_ROLE_LABELS[invitation.role]}</p>
                    <p className="text-sm text-muted-foreground">
                      Expires {new Date(invitation.expiresAt).toLocaleString()}
                    </p>
                  </div>

                  {invitation.canRevoke && (
                    <ConfirmDialog
                      triggerLabel="Revoke"
                      title="Revoke this event invitation?"
                      description={invitation.recipientEmail}
                      confirmLabel="Revoke invitation"
                      destructive
                      disabled={
                        writesDisabled ||
                        Date.parse(invitation.expiresAt) <= now
                      }
                      onConfirm={async () => {
                        const saved = await write.run(async (signal) => {
                          await revokeEventInvitation(
                            user,
                            organizationId,
                            event.id,
                            invitation.id,
                            signal,
                          );
                          return 'Invitation revoked.';
                        });

                        if (!saved) {
                          throw new Error('Revocation failed.');
                        }
                      }}
                    />
                  )}
                </li>
              ))}
            </ul>

            {invitationsQuery.hasNextPage && (
              <Button
                type="button"
                variant="outline"
                disabled={
                  busy || invitaitonsRepeated || !!invitationsQuery.error
                }
                onClick={() => {
                  void invitationsQuery.fetchNextPage({
                    cancelRefetch: false,
                  });
                }}
              >
                Load more invitations
              </Button>
            )}
          </section>
        </>
      )}
    </div>
  );
};
