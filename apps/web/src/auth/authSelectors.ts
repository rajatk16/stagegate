import { useAuthStore } from './authStore';

export const useAuthenticatedUser = () =>
  useAuthStore((state) => state.authenticatedUser);

export const useFirebaseUser = () =>
  useAuthStore((state) => state.firebaseUser);

export const useAccessToken = () => useAuthStore((state) => state.accessToken);

export const useAuthInitialized = () =>
  useAuthStore((state) => state.initialized);

export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.authenticatedUser);
