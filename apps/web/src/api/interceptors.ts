import type { AxiosError, AxiosInstance } from 'axios';

export const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.error('Unauthorized');
      }

      throw Promise.reject(error);
    },
  );
};
