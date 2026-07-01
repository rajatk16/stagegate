import { useMutation, useQueryClient } from '@tanstack/react-query';

import { archive, organizationsKeys } from '../api';

export const useArchiveOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archive,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.all,
      });
    },
  });
};
