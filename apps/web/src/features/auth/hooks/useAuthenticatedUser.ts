import { useAuthStore } from '../store';

export const useAuthenticatedUser = () =>
  useAuthStore((state) => state.authenticatedUser);
