import { User } from 'firebase/auth';

import { Button, InlineAlert } from '@/components';

import { Organization } from '../services';
import { OrganizationMembersTable } from '../components';
import { useOrganizationMembers, useOrganizations } from '../hooks';

type ContentProps = {
  user: User;
  organization: Organization;
};

export const OrganizationMembersContent = ({
  user,
  organization,
}: ContentProps) => {
  const { reload: reloadOrganizations } = useOrganizations();
  const { state, refresh, loadMore } = useOrganizationMembers(
    user,
    organization.id,
  );

  return (
    <section
      aria-labelledby="organization-team-heading"
      className="space-y-6 rounded-2xl border bg-card p-4 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 id="organization-team-heading" className="text-xl font-semibold">
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
          disabled={state.status === 'loading'}
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
          </div>
        </>
      )}
    </section>
  );
};
