import { User } from 'firebase/auth';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { Button, InlineAlert } from '@/components';
import { getOrganizationSectionPath } from '@/lib';

import { changeOrganizationMemberStatus } from '../services';
import { OwnershipTranferAction } from './OwnershipTranferAction';
import { useOrganizationMembers, useOrganizations } from '../hooks';
import { Organization, ORGANIZATION_MEMBERSHIP_STATUSES } from '../types';
import {
  MembershipActionDialog,
  OrganizationMembersTable,
} from '../components';
import { queryKeys, useApiMutation } from '@/app/query';

type ContentProps = {
  user: User;
  organization: Organization;
};

export const OrganizationMembersContent = ({
  user,
  organization,
}: ContentProps) => {
  const navigate = useNavigate();
  const { reload: reloadOrganizations } = useOrganizations();
  const { state, refresh, loadMore } = useOrganizationMembers(
    user,
    organization.id,
  );

  const statusMutation = useApiMutation({
    user,
    request: changeOrganizationMemberStatus,
    affected: [
      queryKeys.organizations(user.uid),
      queryKeys.organization(user.uid, organization.id),
    ],
  });

  const [mutationPending, setMutationPending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  return (
    <section
      aria-labelledby="organization-team-heading"
      className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2
            id="organization-team-heading"
            className="text-xl font-semibold"
            ref={headingRef}
            tabIndex={-1}
          >
            Organization team
          </h2>

          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            View the members of {organization.name}, their roles, and their
            membership status.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="min-h-11 shrink-0"
          disabled={state.status === 'loading' || mutationPending}
          onClick={refresh}
        >
          Refresh list
        </Button>
      </div>

      {state.status === 'loading' && (
        <div
          role="status"
          className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground"
        >
          Loading organization team…
        </div>
      )}

      {notice !== null && (
        <InlineAlert tone="success" title="Membership updated">
          {notice}
        </InlineAlert>
      )}

      {state.status === 'error' && (
        <div className="space-y-4">
          <InlineAlert tone="error" title="Could not load the team">
            {state.message}
          </InlineAlert>

          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={state.accessChanged ? reloadOrganizations : refresh}
          >
            {state.accessChanged ? 'Refresh access' : 'Try again'}
          </Button>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          {state.items.length === 0 ? (
            <div className="space-y-2 rounded-xl border border-dashed p-8 text-center">
              <h3 className="font-medium">No team members to display</h3>

              <p className="text-sm leading-6 text-muted-foreground">
                No members were returned for this organization. Refresh the list
                if you expected to see someone.
              </p>
            </div>
          ) : (
            <OrganizationMembersTable
              members={state.items}
              currentUserUid={user.uid}
              organizationName={organization.name}
              renderActions={(member) => {
                if (
                  !member.actions.suspend &&
                  !member.actions.reactivate &&
                  !member.actions.transferOwnership
                ) {
                  return <span className="text-muted-foreground">-</span>;
                }

                const suspending = member.actions.suspend;
                const nextStatus = suspending
                  ? ORGANIZATION_MEMBERSHIP_STATUSES.SUSPENDED
                  : ORGANIZATION_MEMBERSHIP_STATUSES.ACTIVE;
                const person =
                  member.displayName ?? member.email ?? 'This member';

                return (
                  <div className="flex flex-wrap gap-2">
                    <MembershipActionDialog
                      context="member"
                      triggerLabel={suspending ? 'Suspend' : 'Reactivate'}
                      title={
                        suspending
                          ? `Suspend ${person}`
                          : `Reactivate ${person}`
                      }
                      description={
                        suspending
                          ? `${person} will lose access to ${organization.name}. Their membership, role, and existing organization data will remain. An authorized member can reactivate them later.`
                          : `${person} will regain access to ${organization.name} with their existing ${member.role.toLowerCase()} role. A new invitation is not required.`
                      }
                      confirmLabel={
                        suspending ? 'Suspend member' : 'Reactivate member'
                      }
                      pendingLabel={
                        suspending ? 'Suspending...' : 'Reactivating...'
                      }
                      destructive={suspending}
                      disabled={mutationPending || state.loadingMore}
                      restoreFocus={() => headingRef.current?.focus()}
                      onPendingChange={setMutationPending}
                      run={(signal) =>
                        statusMutation.execute(
                          organization.id,
                          member.uid,
                          nextStatus,
                          signal,
                        )
                      }
                      onSuccess={() => {
                        setNotice(
                          suspending
                            ? `${person} was suspended. Their role was preserved.`
                            : `${person} was reactivated with their existing role.`,
                        );
                      }}
                    />
                    {member.actions.transferOwnership && (
                      <OwnershipTranferAction
                        user={user}
                        member={member}
                        organization={organization}
                        disabled={mutationPending || state.loadingMore}
                        onPendingChange={setMutationPending}
                        restoreFocus={() => headingRef.current?.focus()}
                        onSuccess={() => {
                          void navigate(
                            getOrganizationSectionPath(
                              organization.slug,
                              'activity',
                            ),
                            {
                              replace: true,
                              state: {
                                ownershipTransferred: {
                                  organizationId: organization.id,
                                  uid: user.uid,
                                },
                              },
                            },
                          );
                        }}
                      />
                    )}
                  </div>
                );
              }}
            />
          )}

          {state.pageError !== null && (
            <InlineAlert tone="error" title="Could not load more members">
              <p>{state.pageError}</p>

              {state.restartRequired && (
                <p className="mt-2">Use Refresh list to restart pagination.</p>
              )}
            </InlineAlert>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p
              role="status"
              aria-atomic="true"
              className="text-sm text-muted-foreground"
            >
              {state.items.length}{' '}
              {state.items.length === 1 ? 'member' : 'members'} shown.
              {state.nextCursor === null && ' All members loaded.'}
            </p>

            {state.items.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={
                  mutationPending ||
                  state.loadingMore ||
                  state.nextCursor === null ||
                  state.restartRequired
                }
                onClick={loadMore}
              >
                {state.loadingMore
                  ? 'Loading more…'
                  : state.nextCursor === null
                    ? 'All members loaded'
                    : state.pageError !== null
                      ? 'Retry loading more'
                      : 'Load more'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              disabled={mutationPending}
              onClick={reloadOrganizations}
            >
              Refresh access
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
