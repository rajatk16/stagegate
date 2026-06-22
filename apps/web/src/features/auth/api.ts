import { apiClient, type ApiResponse } from '@/api';

import type { AuthenticatedUser } from './types';

export const getCurrentUser = async () => {
  const response =
    await apiClient.get<ApiResponse<AuthenticatedUser>>('/auth/me');

  return response.data.data;
};
