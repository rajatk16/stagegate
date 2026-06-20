import { apiClient } from '@/api/apiClient';
import type { Organization } from './types';
import type { ApiResponse } from '@/api/types';

export const getOrganizations = async () => {
  const response =
    await apiClient.get<ApiResponse<Organization[]>>('/organizations');

  return response.data.data;
};
