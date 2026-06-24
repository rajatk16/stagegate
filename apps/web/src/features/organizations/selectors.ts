import { useOrganizationStore } from './store';

export const useOrganizations = () =>
  useOrganizationStore((state) => state.organizations);

export const useCurrentOrganization = () =>
  useOrganizationStore((state) => state.currentOrganization);

export const useHasOrganizations = () =>
  useOrganizationStore((state) => state.organizations.length > 0);
