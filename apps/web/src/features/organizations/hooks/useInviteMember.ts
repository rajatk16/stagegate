import { useMutation, useQueryClient } from '@tanstack/react-query';

import { inviteMember, organizationsKeys } from '../api';
import type { CreateOrganizationInvitationRequest } from '../types';

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      payload,
    }: {
      organizationSlug: string;
      payload: CreateOrganizationInvitationRequest;
    }) => inviteMember(organizationSlug, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.invitations(variables.organizationSlug),
      });
    },
  });
};
