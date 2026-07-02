import { useMemo } from 'react';

import { useOrganizationStore } from '../store';
import type { OrganizationSummary } from '../types';

export const useCurrentOrganization = (): OrganizationSummary | null =>
  useOrganizationStore((state) => state.currentOrganization ?? null);

export const useCurrentOrganizationSlug = () => {
  const organization = useCurrentOrganization();

  return organization?.slug ?? null;
};

export const useCurrentOrganizationId = () => {
  const organization = useCurrentOrganization();

  return organization?.id ?? null;
};

export const useSetCurrentOrganization = () =>
  useOrganizationStore((state) => state.setCurrentOrganization);

export const useClearCurrentOrganization = () =>
  useOrganizationStore((state) => state.clearCurrentOrganization);

export const useHasCurrentOrganization = () => {
  const organization = useCurrentOrganization();

  return organization !== null;
};

export const useOrganizationContext = () => {
  const organization = useCurrentOrganization();

  const setOrganization = useSetCurrentOrganization();

  const clearOrganization = useClearCurrentOrganization();

  return useMemo(
    () => ({
      organization,
      organizationId: organization?.id ?? null,
      organizationSlug: organization?.slug ?? null,
      hasOrganization: organization !== null,
      setOrganization,
      clearOrganization,
    }),
    [clearOrganization, organization, setOrganization],
  );
};
