import type { AxiosError, AxiosInstance } from 'axios';

import { firebaseAuthService, useAuthStore } from '@/features/auth';

export const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().firebaseUser?.getIdToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        firebaseAuthService.signOut();
        useAuthStore.getState().reset();
      }

      throw Promise.reject(error);
    },
  );
};
