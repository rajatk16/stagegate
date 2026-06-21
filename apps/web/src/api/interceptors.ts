import type { AxiosError, AxiosInstance } from 'axios';

import { useAuthStore } from '@/auth/authStore';

export const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
      }

      throw Promise.reject(error);
    },
  );
};
