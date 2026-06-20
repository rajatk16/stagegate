import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '@/firebase/firebase';

import { useAuthStore } from './authStore';
import { saveAccessToken } from './authStorage';

export const initializeAuth = () => {
  const store = useAuthStore.getState();

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      store.setUser(null);
      store.setAccessToken(null);
      store.setInitialized(false);

      return;
    }

    const token = await firebaseUser.getIdToken();

    saveAccessToken(token);

    store.setUser({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
    });

    store.setAccessToken(token);

    store.setInitialized(true);
  });
};
