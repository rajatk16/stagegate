import { useQuery } from '@tanstack/react-query';

import { ApiError } from '../../../lib';
import { MemberList } from '../components';
import { useOrganization } from '../../organizations';
import { listOrganizationMembers } from '../services';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.problem.status === 403) {
      return 'Your organization role does not allow you to view members.';
    }

    return error.problem.detail;
  }

  return 'The member list could not be loaded. Please try again.';
};

export const MembersPage = () => {
  const { activeOrganization, isLoading: isLoadingOrganization } = useOrganization();

  const organizationId = activeOrganization?.organizationId ?? null;

  const membersQuery = useQuery({
    queryKey: ['organizationMembers', organizationId],
    enabled: organizationId !== null,
    queryFn: () => {
      if (organizationId === null) {
        throw new Error('An active organization is required.');
      }

      return listOrganizationMembers(organizationId);
    },
  });

  if (isLoadingOrganization) {
    return (
      <div className="mx-auto max-w-6xl" role="status">
        <p className="text-sm text-slate-600">Loading organization...</p>
      </div>
    );
  }

  if (activeOrganization === null) {
    return (
      <div className="mx-auto max-w-6xl">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Members</h1>

          <p className="mt-2 text-slate-600">
            Create or select organization before viewing members.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <p className="text-brand-600 text-sm font-semibold">{activeOrganization.name}</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Members</h1>

        <p className="mt-2 max-w-2xl text-slate-600">
          View the people in this organization and the access assigned to each role.
        </p>
      </header>

      <section aria-labelledby="member-list-heading" className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-950" id="member-list-heading">
            Organization members
          </h2>

          {membersQuery.data !== undefined ? (
            <p className="text-sm text-slate-500" aria-live="polite">
              {membersQuery.data.length} {membersQuery.data.length === 1 ? 'member' : 'members'}
            </p>
          ) : null}
        </div>

        {membersQuery.isPending ? (
          <div
            className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-600"
            role="status"
          >
            Loading members...
          </div>
        ) : membersQuery.isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6" role="alert">
            <h2 className="font-semibold text-red-900">Members unavailable</h2>

            <p className="mt-2 text-sm text-red-800">{getErrorMessage(membersQuery.error)}</p>

            <button
              className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
              onClick={() => void membersQuery.refetch()}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : (
          <MemberList members={membersQuery.data} />
        )}
      </section>
    </div>
  );
};
