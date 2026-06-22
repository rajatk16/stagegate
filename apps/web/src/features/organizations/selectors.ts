import { useOrganizationStore } from './store';

export const useOrganizations = () =>
  useOrganizationStore((state) => state.organizations);

export const useCurrentOrganization = () =>
  useOrganizationStore((state) => state.currentOrganization);
