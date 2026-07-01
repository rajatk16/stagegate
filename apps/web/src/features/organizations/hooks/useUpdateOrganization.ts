import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateOrganizationRequest } from '../types';
import { organizationsKeys, update } from '../api';

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      payload,
    }: {
      organizationSlug: string;
      payload: UpdateOrganizationRequest;
    }) => update(organizationSlug, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.detail(variables.organizationSlug),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
    },
  });
};
