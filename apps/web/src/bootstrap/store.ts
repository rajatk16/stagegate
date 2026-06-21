import { create } from 'zustand';

interface BootstrapState {
  initialized: boolean;

  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

export const useBootstrapStore = create<BootstrapState>((set) => ({
  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set({ initialized: false }),
}));
