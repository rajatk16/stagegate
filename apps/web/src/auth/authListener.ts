import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebase/firebase';
import { getCurrentUser } from '@/features/auth/api';

import { useAuthStore } from './authStore';
import { clearAccessToken, saveAccessToken } from './authStorage';

export const initializeAuth = () => {
  return onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      const store = useAuthStore.getState();
      try {
        if (!firebaseUser) {
          clearAccessToken();
          store.logout();
          return;
        }

        const token = await firebaseUser.getIdToken();

        saveAccessToken(token);
        store.setAccessToken(token);

        store.setFirebaseUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });

        const authenticatedUser = await getCurrentUser();

        store.setAuthenticatedUser(authenticatedUser);
      } catch {
        store.logout();
      } finally {
        store.setInitialized(true);
      }
    },
    (error) => {
      console.error('Firebase auth error:', error);
      const store = useAuthStore.getState();
      store.logout();
      store.setInitialized(true);
    },
  );
};
