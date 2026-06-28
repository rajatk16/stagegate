import { AxiosError } from 'axios';
import { useEffect, type PropsWithChildren } from 'react';

import { apiClient } from '@/lib/api';
import {
  useAuthStore,
  firebaseAuthService,
  getAuthenticatedUser,
} from '@/features/auth';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  useEffect(() => {
    const { setInitialized, setFirebaseUser, setAuthenticatedUser, reset } =
      useAuthStore.getState();

    const unsubscribe = firebaseAuthService.subscribe(async (firebaseUser) => {
      try {
        setFirebaseUser(firebaseUser);

        if (!firebaseUser) {
          delete apiClient.defaults.headers.common.Authorization;

          setAuthenticatedUser(null);
          setInitialized(true);
          return;
        }

        const idToken = await firebaseAuthService.getIdToken();

        apiClient.defaults.headers.common.Authorization = `Bearer ${idToken}`;

        const authenticatedUser = await getAuthenticatedUser();

        setAuthenticatedUser(authenticatedUser);
      } catch (error) {
        console.error(error);

        if (error instanceof AxiosError && error?.response?.status === 401) {
          await firebaseAuthService.signOut();
        }

        reset();
      } finally {
        setInitialized(true);
      }
    });
    return unsubscribe;
  }, []);

  return <>{children}</>;
};
