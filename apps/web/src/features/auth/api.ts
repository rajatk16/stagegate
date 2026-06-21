import { apiClient } from '@/api/apiClient';
import type { ApiResponse } from '@/api/types';
import type { AuthenticatedUser } from '@/auth/authTypes';

export const getCurrentUser = async () => {
  const response =
    await apiClient.get<ApiResponse<AuthenticatedUser>>('/auth/me');

  return response.data.data;
};
