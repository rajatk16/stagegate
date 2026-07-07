import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ApiResponse } from '@/lib';

import {
  get,
  list,
  getMembers,
  getCurrentMember,
  organizationsKeys,
} from '../api';
import type {
  OrganizationMember,
  OrganizationDetails,
  OrganizationSummary,
} from '../types';

export const useCurrentOrganizationMember = (
  organizationSlug: string,
): UseQueryResult<OrganizationMember> =>
  useQuery<ApiResponse<OrganizationMember>, Error, OrganizationMember>({
    enabled: !!organizationSlug,
    queryFn: () => getCurrentMember(organizationSlug),
    queryKey: organizationsKeys.currentMember(organizationSlug),
    select: (response) => response.data,
  });

export const useOrganization = (organizationSlug: string) =>
  useQuery<ApiResponse<OrganizationDetails>, Error, OrganizationDetails>({
    queryKey: organizationsKeys.detail(organizationSlug),
    queryFn: () => get(organizationSlug),
    enabled: !!organizationSlug,
    select: (response) => response.data,
  });

export const useOrganizationMembers = (organizationSlug: string) =>
  useQuery<ApiResponse<OrganizationMember[]>, Error, OrganizationMember[]>({
    queryKey: organizationsKeys.members(organizationSlug),
    queryFn: () => getMembers(organizationSlug),
    enabled: !!organizationSlug,
    select: (response) => response.data,
  });

export const useOrganizations = () =>
  useQuery<ApiResponse<OrganizationSummary[]>, Error, OrganizationSummary[]>({
    queryKey: organizationsKeys.list(),
    queryFn: list,
    select: (response) => response.data,
  });
