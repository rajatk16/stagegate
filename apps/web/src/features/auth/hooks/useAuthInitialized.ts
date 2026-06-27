import { useAuthStore } from '../store';

export const useAuthInitialized = () =>
  useAuthStore((state) => state.initialized);
