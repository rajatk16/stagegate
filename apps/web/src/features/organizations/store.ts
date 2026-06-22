import { create } from 'zustand';

import { mockOrganizations } from './mock';
import type { Organization } from './types';

interface OrganizationState {
  organizations: Organization[];

  currentOrganization: Organization | null;

  setCurrentOrganization: (organization: Organization) => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: mockOrganizations,
  currentOrganization: mockOrganizations[0],
  setCurrentOrganization: (organization) =>
    set({ currentOrganization: organization }),
}));
