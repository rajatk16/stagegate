import { create } from 'zustand';

import type { AuthenticatedUser, FirebaseUserInfo } from './types';

export interface AuthState {
  firebaseUser: FirebaseUserInfo | null;
  authenticatedUser: AuthenticatedUser | null;
  accessToken: string | null;
  initialized: boolean;

  setFirebaseUser: (user: FirebaseUserInfo | null) => void;
  setAuthenticatedUser: (user: AuthenticatedUser | null) => void;
  setAccessToken: (token: string | null) => void;
  setInitialized: (value: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  firebaseUser: null,
  authenticatedUser: null,
  accessToken: null,
  initialized: false,
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setAuthenticatedUser: (authenticatedUser) => set({ authenticatedUser }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setInitialized: (initialized) => set({ initialized }),
  logout: () => {
    set({
      firebaseUser: null,
      authenticatedUser: null,
      accessToken: null,
    });
  },
  reset: () =>
    set({
      firebaseUser: null,
      authenticatedUser: null,
      accessToken: null,
      initialized: false,
    }),
}));
