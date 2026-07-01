import { useMutation, useQueryClient } from '@tanstack/react-query';

import { organizationsKeys, transferOwnership } from '../api';
import type { TransferOrganizationOwnershipRequest } from '../types';

export const useTransferOwnership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      payload,
    }: {
      organizationSlug: string;
      payload: TransferOrganizationOwnershipRequest;
    }) => transferOwnership(organizationSlug, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.detail(variables.organizationSlug),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.members(variables.organizationSlug),
      });
    },
  });
};
