import { User } from 'firebase/auth';
import { Outlet } from 'react-router';

import { useAuth } from '@/features/auth';
import { useQueryClient } from '@tanstack/react-query';
import { isAccessError, queryKeys, useMyOrganizationsQuery } from '@/app/query';
import { OrganizationsContext, OrganizationsState } from '../context';
import { getOrganizationListErrorMessage } from '../services';
import { Organization } from '../types';

const OrganizationSession = ({ user }: { user: User }) => {
  const client = useQueryClient();
  const query = useMyOrganizationsQuery(user);
  const key = queryKeys.organizations(user.uid);

  let state: OrganizationsState;

  if (isAccessError(query.error)) {
    state = {
      status: 'error',
      message: getOrganizationListErrorMessage(query.error),
    };
  } else if (query.data !== undefined) {
    state = {
      status: 'ready',
      organizations: query.data,
    };
  } else if (query.isError) {
    state = {
      status: 'error',
      message: getOrganizationListErrorMessage(query.error),
    };
  } else {
    state = { status: 'loading' };
  }

  const reload = () => {
    void client.invalidateQueries({
      queryKey: queryKeys.account(user.uid),
      refetchType: 'none',
    });

    void client.resetQueries({
      queryKey: key,
      exact: true,
    });
  };

  const replaceOrganization = (updated: Organization) => {
    if (updated.membership.uid !== user.uid) return;

    client.setQueryData<Organization[]>(key, (current) => {
      if (!current) return current;

      return current
        .map((organization) => {
          if (organization.id !== updated.id) return organization;

          return Date.parse(updated.updatedAt) >=
            Date.parse(organization.updatedAt)
            ? updated
            : organization;
        })
        .sort(
          (left, right) =>
            left.name.localeCompare(right.name) ||
            left.id.localeCompare(right.id),
        );
    });
  };

  const refreshError =
    query.error && query.data && !isAccessError(query.error)
      ? getOrganizationListErrorMessage(query.error)
      : null;

  return (
    <OrganizationsContext.Provider
      value={{
        state,
        reload,
        replaceOrganization,
        refreshError,
      }}
    >
      <Outlet />
    </OrganizationsContext.Provider>
  );
};

export const OrganizationsProvider = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return <OrganizationSession key={session.user.uid} user={session.user} />;
};
