import { useAuthStore } from '../store';

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.authenticatedUser !== null);
