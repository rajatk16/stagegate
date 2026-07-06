import { useQuery } from '@tanstack/react-query';

import type { ApiResponse } from '@/lib';

import {
  get,
  list,
  getMembers,
  getCurrentMember,
  organizationsKeys,
} from '../api';
import type { OrganizationMember, OrganizationSummary } from '../types';

export const useCurrentOrganizationMember = (organizationSlug: string) =>
  useQuery({
    enabled: !!organizationSlug,
    queryFn: () => getCurrentMember(organizationSlug),
    queryKey: organizationsKeys.currentMember(organizationSlug),
  });

export const useOrganization = (organizationSlug: string) =>
  useQuery({
    queryKey: organizationsKeys.detail(organizationSlug),
    queryFn: () => get(organizationSlug),
    enabled: !!organizationSlug,
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
