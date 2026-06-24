import { apiClient, type ApiResponse } from '@/api';

import type { CreateOrganizationRequest, Organization } from './types';

export const getOrganizations = async () => {
  const response =
    await apiClient.get<ApiResponse<Organization[]>>('/organizations');

  return response.data.data;
};

export const createOrganization = async (
  payload: CreateOrganizationRequest,
): Promise<Organization> => {
  const response = await apiClient.post<ApiResponse<Organization>>(
    '/organizations',
    payload,
  );

  return response.data.data;
};
