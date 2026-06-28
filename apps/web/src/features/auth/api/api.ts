import { apiClient, type ApiResponse } from '@/lib/api';

import type { AuthenticatedUser } from '../types';

export const getAuthenticatedUser = async () => {
  const response =
    await apiClient.get<ApiResponse<AuthenticatedUser>>('/auth/me');

  return response.data.data;
};
