import { useMutation, useQueryClient } from '@tanstack/react-query';

import { create, organizationsKeys } from '../api';

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
    },
  });
};
