import { create } from 'zustand';
import type { User } from 'firebase/auth';

import type { AuthenticatedUser } from '../types';

interface AuthState {
  initialized: boolean;
  firebaseUser: User | null;
  authenticatedUser: AuthenticatedUser | null;
}

interface AuthActions {
  setInitialized: (initialized: boolean) => void;
  setFirebaseUser: (firebaseUser: User | null) => void;
  setAuthenticatedUser: (authenticatedUser: AuthenticatedUser | null) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  initialized: false,
  firebaseUser: null,
  authenticatedUser: null,
};

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,

  setInitialized: (initialized) => set({ initialized }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setAuthenticatedUser: (authenticatedUser) => set({ authenticatedUser }),
  reset: () => set(initialState),
}));
