import { apiClient, type ApiResponse } from '@/api';

import type { Organization } from './types';

export const getOrganizations = async () => {
  const response =
    await apiClient.get<ApiResponse<Organization[]>>('/organizations');

  return response.data.data;
};
