import { create } from 'zustand';

import type { Organization } from './types';

interface OrganizationState {
  organizations: Organization[];

  currentOrganization: Organization | null;

  setOrganizations: (organizations: Organization[]) => void;

  setCurrentOrganization: (organization: Organization | null) => void;
  clearOrganizations: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  currentOrganization: null,
  setOrganizations: (organizations) => set({ organizations }),
  setCurrentOrganization: (organization) =>
    set({ currentOrganization: organization }),
  clearOrganizations: () =>
    set({ organizations: [], currentOrganization: null }),
}));
