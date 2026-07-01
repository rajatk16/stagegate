import { useMutation, useQueryClient } from '@tanstack/react-query';

import { restore, organizationsKeys } from '../api';

export const useRestoreOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restore,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.all,
      });
    },
  });
};
