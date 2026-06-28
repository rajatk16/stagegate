import axios from 'axios';

import { setupInterceptors } from './interceptors';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);
