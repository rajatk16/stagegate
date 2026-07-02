import type { AxiosError, AxiosInstance } from 'axios';

import { useAuthStore } from '@/features/auth/store';
import { firebaseAuthService } from '@/features/auth/services';

export const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(async (config) => {
    const token = await useAuthStore.getState().firebaseUser?.getIdToken();

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
