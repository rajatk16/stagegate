import { useAuthStore } from '../store';

export const useFirebaseUser = () =>
  useAuthStore((state) => state.firebaseUser);
