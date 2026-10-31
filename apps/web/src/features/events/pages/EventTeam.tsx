import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Button, InlineAlert, ConfirmDialog } from '@/components';
import {
  queryKeys,
  isAccessError,
  hasRepeatedCursor,
  useEventMembersQuery,
} from '@/app/query';

import { RoleEditor, AddEventMemberForm } from '../components';
import type { AddEventMemberInput } from '../types';
import { useEventTeamWrite, useEventWorkspace } from '../hooks';
import { addEventMember, updateEventMemberStatus } from '../services';
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

  const canRead = hasEventPermission(access, 'event:members:read');

  const canManage =
    access.authority.kind === 'ORGANIZATION_ADMIN' &&
    hasEventPermission(access, 'event:members:manage');

  const archived = event.status === 'ARCHIVED';

  const grantable = getGrantableEventRoles(access.authority);

  const membersQuery = useEventMembersQuery(
    user,
    organizationId,
    event.id,
    canRead,
  );

  const membersRepeated = hasRepeatedCursor(membersQuery.data);

  const accessError = isAccessError(membersQuery.error);

  const members = [
    ...new Map(
      (membersQuery.data?.pages.flatMap((page) => page.items) ?? []).map(
        (member) => [member.uid, member],
      ),
    ).values(),
  ];

  const busy = write.pending || refreshing || membersQuery.isFetching;

  const writesDisabled =
    busy ||
    write.needsRefresh ||
    accessError ||
    !canManage ||
    Boolean(membersQuery.error) ||
    membersRepeated;

  const refresh = async () => {
    if (write.pending || refreshing) {
      return;
    }

    setRefreshing(true);
    setRefreshError(null);

    try {
      await refreshAccess();

      await Promise.all([
        client.resetQueries(
          {
            queryKey: queryKeys.eventMembers(
              user.uid,
              organizationId,
              event.id,
            ),
            exact: true,
          },
          {
            throwOnError: true,
          },
        ),
        ...(canManage
          ? [
              client.resetQueries(
                {
                  queryKey: queryKeys.resources(
                    user.uid,
                    organizationId,
                    'members',
                  ),
                  exact: true,
                },
                {
                  throwOnError: true,
                },
              ),
            ]
          : []),
      ]);

      write.clearAfterRefresh();
    } catch {
      setRefreshError('Could not refresh the team. Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const add = async (values: AddEventMemberInput): Promise<boolean> => {
    if (writesDisabled || archived || !grantable.includes(values.role)) {
      return false;
    }

    return write.run(async (signal) => {
      await addEventMember(user, organizationId, event.id, values, signal);

      return 'Member added to the event.';
    });
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

        {refreshError && <InlineAlert tone="error">{refreshError}</InlineAlert>}
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
          This event is archived. New assignments, role changes, and
          reactivation are unavailable.
        </InlineAlert>
      )}

      <section className="space-y-4 rounded-2xl border p-5">
        <h3 className="text-lg font-semibold">Assigned members</h3>

        <p className="text-sm text-muted-foreground">
          Organization owners and administrators already have access and do not
          need an assignment.
        </p>

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
              No event assignments are shown.
            </p>
          )}

        <ul className="divide-y">
          {members.map((member) => {
            const manageable =
              canManage &&
              member.uid !== user.uid &&
              grantable.includes(member.role);

            const organizationSuspended =
              member.organizationStatus === 'SUSPENDED';

            const nextStatus =
              member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';

            const canChangeStatus =
              manageable &&
              (!archived || nextStatus === 'SUSPENDED') &&
              (!organizationSuspended || nextStatus === 'SUSPENDED');

            return (
              <li key={member.uid} className="space-y-4 py-4">
                <div className="space-y-1">
                  <p className="break-all font-medium">
                    {member.uid}
                    {member.uid === user.uid ? ' (You)' : ''}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {EVENT_ROLE_LABELS[member.role]}
                    {' · '}
                    Assignment: {member.status}
                  </p>

                  {organizationSuspended && (
                    <p className="text-sm text-muted-foreground">
                      Organization membership is suspended. Event access is
                      blocked.
                    </p>
                  )}
                </div>

                {manageable && (
                  <div className="space-y-3">
                    {member.status === 'ACTIVE' &&
                      !organizationSuspended &&
                      !archived && (
                        <RoleEditor
                          key={`${member.uid}:${member.role}:${member.updatedAt}`}
                          member={member}
                          disabled={writesDisabled}
                          write={write}
                        />
                      )}

                    {canChangeStatus && (
                      <ConfirmDialog
                        triggerLabel={
                          nextStatus === 'SUSPENDED'
                            ? 'Suspend assignment'
                            : 'Reactivate assignment'
                        }
                        title={
                          nextStatus === 'SUSPENDED'
                            ? 'Suspend this event assignment?'
                            : 'Reactivate this event assignment?'
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

                            return 'Event assignment updated.';
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
            disabled={busy || membersRepeated || Boolean(membersQuery.error)}
            onClick={() => {
              void membersQuery.fetchNextPage({
                cancelRefetch: false,
              });
            }}
          >
            Load more assigned members
          </Button>
        )}
      </section>

      {canManage && (
        <AddEventMemberForm
          assignedUids={members.map((member) => member.uid)}
          roles={grantable}
          disabled={writesDisabled || archived}
          pending={write.pending}
          onAdd={add}
        />
      )}
    </div>
  );
};
