import { useAuthStore } from './authStore';

export const useCurrentUser = () => useAuthStore((state) => state.user);

export const useAccessToken = () => useAuthStore((state) => state.accessToken);

export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.accessToken);

export const useAuthInitialized = () =>
  useAuthStore((state) => state.initialized);
