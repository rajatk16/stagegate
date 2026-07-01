import { useEffect, useMemo } from 'react';

import { useOrganizations } from './queries';
import { useOrganizationStore } from '../store';

export const useOrganizationBootstrap = () => {
  const {
    data: organizations,
    isSuccess,
    isLoading,
    isError,
    error,
  } = useOrganizations();

  const currentOrganization = useOrganizationStore(
    (state) => state.currentOrganization,
  );

  const setCurrentOrganization = useOrganizationStore(
    (state) => state.setCurrentOrganization,
  );

  useEffect(() => {
    if (!isSuccess || !organizations) return;

    if (organizations.length === 0) {
      setCurrentOrganization(null);
      return;
    }

    if (!currentOrganization) {
      setCurrentOrganization(organizations[0]);
      return;
    }

    const latestOrganization = organizations.find(
      (organization) => organization.id === currentOrganization.id,
    );

    if (latestOrganization) {
      setCurrentOrganization(latestOrganization);
      return;
    }

    setCurrentOrganization(organizations[0]);
  }, [currentOrganization, isSuccess, organizations, setCurrentOrganization]);

  const isBootstrapped = useMemo(() => {
    if (!isSuccess) {
      return false;
    }

    return true;
  }, [isSuccess]);

  return {
    organizations: organizations ?? [],
    isBootstrapped,
    isLoading,
    isError,
    error,
  };
};
