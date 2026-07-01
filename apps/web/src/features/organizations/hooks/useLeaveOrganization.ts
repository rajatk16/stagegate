import { useMutation, useQueryClient } from '@tanstack/react-query';

import { leaveOrganization, organizationsKeys } from '../api';

export const useLeaveOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationSlug }: { organizationSlug: string }) =>
      leaveOrganization(organizationSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
    },
  });
};
