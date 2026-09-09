import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../../lib';
import { OrganizationContext } from '../context';
import {
  listOrganizations,
  type Organization,
  createOrganization,
  bootstrapCurrentUser,
} from '../services';

const organizationQueryKey = (userId: string) => ['organizations', userId];

const activeOrganizationStorageKey = (userId: string) => `stagegate.activeOrganizationId:${userId}`;

interface AuthenticatedOrganizationProviderProps {
  readonly userId: string;
}

const AuthenticatedOrganizationProvider = (
  props: PropsWithChildren<AuthenticatedOrganizationProviderProps>,
) => {
  const queryClient = useQueryClient();
  const storageKey = activeOrganizationStorageKey(props.userId);

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(() =>
    window.localStorage.getItem(storageKey),
  );

  const organizationsQuery = useQuery({
    queryKey: organizationQueryKey(props.userId),
    queryFn: async () => {
      await bootstrapCurrentUser();
      return listOrganizations();
    },
  });

  const organizations = useMemo(() => organizationsQuery.data ?? [], [organizationsQuery.data]);

  const activeOrganization =
    organizations.find((organization) => organization.organizationId === selectedOrganizationId) ??
    organizations[0] ??
    null;

  useEffect(() => {
    if (activeOrganization === null) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, activeOrganization.organizationId);
  }, [activeOrganization, storageKey]);

  const creationMutation = useMutation({
    mutationFn: createOrganization,
    onSuccess: (organization) => {
      queryClient.setQueryData<readonly Organization[]>(
        organizationQueryKey(props.userId),
        (current = []) =>
          [...current, organization].sort((left, right) => left.name.localeCompare(right.name)),
      );

      setSelectedOrganizationId(organization.organizationId);
    },
  });

  const value = useMemo(
    () => ({
      organizations,
      activeOrganization,
      isLoading: organizationsQuery.isPending,
      isCreating: creationMutation.isPending,
      error: organizationsQuery.error instanceof Error ? organizationsQuery.error : null,
      selectOrganization: (organizationId: string) => {
        if (!organizations.some((organization) => organization.organizationId === organizationId)) {
          throw new Error('The selected organization is not available.');
        }

        setSelectedOrganizationId(organizationId);
      },
      createOrganization: async (name: string) => {
        await creationMutation.mutateAsync(name);
      },
      reload: () => {
        void organizationsQuery.refetch();
      },
    }),
    [activeOrganization, creationMutation, organizations, organizationsQuery],
  );

  return (
    <OrganizationContext.Provider value={value}>{props.children}</OrganizationContext.Provider>
  );
};

export const OrganizationProvider = ({ children }: PropsWithChildren) => {
  const auth = useAuth();

  if (auth.status !== 'authenticated') {
    return null;
  }

  return (
    <AuthenticatedOrganizationProvider userId={auth.user.uid}>
      {children}
    </AuthenticatedOrganizationProvider>
  );
};
