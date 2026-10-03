import { User } from 'firebase/auth';
import { Outlet } from 'react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth';

import { OrganizationsContext, OrganizationsState } from '../context';
import {
  Organization,
  listMyOrganizations,
  getOrganizationListErrorMessage,
} from '../services';

const OrganizationSession = ({ user }: { user: User }) => {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<OrganizationsState>({
    status: 'loading',
  });

  const requestRef = useRef<AbortController | null>(null);

  const reload = useCallback(() => {
    requestRef.current?.abort();
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  const replaceOrganization = useCallback(
    (updated: Organization) => {
      if (updated.membership.uid !== user.uid) return;

      setState((current) => {
        if (current.status !== 'ready') return current;

        return {
          status: 'ready',
          organizations: current.organizations
            .map((organization) => {
              if (organization.id !== updated.id) {
                return organization;
              }

              return Date.parse(updated.updatedAt) >=
                Date.parse(organization.updatedAt)
                ? updated
                : organization;
            })
            .sort(
              (left, right) =>
                left.name.localeCompare(right.name) ||
                left.id.localeCompare(right.id),
            ),
        };
      });
    },
    [user.uid],
  );

  useEffect(() => {
    const controller = new AbortController();
    requestRef.current = controller;

    const load = async () => {
      try {
        const organizations = await listMyOrganizations(
          user,
          controller.signal,
        );

        if (!controller.signal.aborted) {
          setState({
            status: 'ready',
            organizations,
          });
        }
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setState({
            status: 'error',
            message: getOrganizationListErrorMessage(error),
          });
        }
      }
    };

    void load();

    return () => {
      controller.abort();

      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    };
  }, [user, attempt]);

  return (
    <OrganizationsContext.Provider
      value={{ state, reload, replaceOrganization }}
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
