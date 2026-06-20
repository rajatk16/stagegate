import { create } from 'zustand';

import type { AuthState } from './authTypes';
import { clearAccessToken } from './authStorage';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: (initialized) => set({ initialized }),
  logout: () => {
    clearAccessToken();

    set({
      user: null,
      accessToken: null,
    });
  },
}));
