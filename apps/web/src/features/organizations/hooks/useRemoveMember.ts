import { useMutation, useQueryClient } from '@tanstack/react-query';

import { organizationsKeys, removeMember } from '../api';

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      userId,
    }: {
      organizationSlug: string;
      userId: string;
    }) => removeMember(organizationSlug, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.members(variables.organizationSlug),
      });
    },
  });
};
