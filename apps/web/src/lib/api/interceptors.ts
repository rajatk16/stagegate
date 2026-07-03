import type { AxiosError, AxiosInstance } from 'axios';

import { useAuthStore, firebaseAuthService } from '@/features/auth';

export const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(async (config) => {
    const token = await firebaseAuthService.getIdToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
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
