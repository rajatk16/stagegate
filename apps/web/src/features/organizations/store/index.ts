import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { OrganizationSummary } from '../types';

interface OrganizationStore {
  currentOrganization: OrganizationSummary | null;
  setCurrentOrganization: (organization: OrganizationSummary | null) => void;
  clearCurrentOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      currentOrganization: null,
      setCurrentOrganization: (organization) =>
        set({ currentOrganization: organization }),
      clearCurrentOrganization: () => set({ currentOrganization: null }),
    }),
    {
      name: 'stategate-current-organization',
    },
  ),
);
