import { useMutation, useQueryClient } from '@tanstack/react-query';

import { organizationsKeys, updateMemberRoles } from '../api';
import type { UpdateMemberRolesRequest } from '../types';

export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      userId,
      payload,
    }: {
      organizationSlug: string;
      userId: string;
      payload: UpdateMemberRolesRequest;
    }) => updateMemberRoles(organizationSlug, userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.members(variables.organizationSlug),
      });
    },
  });
};
