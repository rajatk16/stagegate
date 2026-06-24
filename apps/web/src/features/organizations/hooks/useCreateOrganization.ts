import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api';

import { createOrganization } from '../api';

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizations,
      });
    },
  });
};
