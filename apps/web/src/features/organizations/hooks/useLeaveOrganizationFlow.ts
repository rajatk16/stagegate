import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import type { ApiResponse } from '@/lib';

import { organizationsKeys } from '../api';
import { useOrganizationStore } from '../store';
import { ORGANIZATION_ROUTES } from '../constants';
import { useLeaveOrganization } from './mutations';
import type { OrganizationSummary } from '../types';

export const useLeaveOrganizationFlow = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { setCurrentOrganization } = useOrganizationStore();

  const leaveMutation = useLeaveOrganization();

  const leaveOrganization = useCallback(
    async (organizationSlug: string) => {
      await leaveMutation.mutateAsync({ organizationSlug });

      await queryClient.invalidateQueries({
        queryKey: organizationsKeys.list(),
      });

      const organizations = queryClient.getQueryData<
        ApiResponse<OrganizationSummary[]>
      >(organizationsKeys.list());

      if (!organizations || !organizations.data) {
        setCurrentOrganization(null);
        return;
      }

      if (organizations.data.length === 0) {
        setCurrentOrganization(null);

        navigate(ORGANIZATION_ROUTES.CREATE, {
          replace: true,
        });
        return;
      }

      const nextOrganization = organizations.data[0];

      setCurrentOrganization(nextOrganization);

      navigate(ORGANIZATION_ROUTES.DASHBOARD(nextOrganization.slug), {
        replace: true,
      });
    },
    [leaveMutation, navigate, queryClient, setCurrentOrganization],
  );

  return {
    ...leaveMutation,
    leaveOrganization,
  };
};
