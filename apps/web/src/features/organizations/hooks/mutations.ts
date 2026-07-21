import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RoutePaths } from '@/app';
import { notificationService, type ApiResponse } from '@/lib';

import { ORGANIZATION_ROUTES } from '../constants';
import { useSetCurrentOrganization } from './useCurrentOrganization';
import type {
  OrganizationSummary,
  OrganizationInvitation,
  UpdateMemberRolesRequest,
  UpdateOrganizationRequest,
  CreateOrganizationInvitationRequest,
  TransferOrganizationOwnershipRequest,
} from '../types';
import {
  create,
  update,
  archive,
  restore,
  inviteMember,
  removeMember,
  acceptInvitation,
  revokeInvitation,
  declineInvitation,
  leaveOrganization,
  organizationsKeys,
  transferOwnership,
  updateMemberRoles,
} from '../api';

interface InvitationActionVariables {
  invitationId: string;
  organizationSlug: string;
}

export const useArchiveOrganization = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ organizationSlug }: { organizationSlug: string }) =>
      archive(organizationSlug),
    onSuccess: async (_, variables) => {
      queryClient.removeQueries({
        queryKey: organizationsKeys.detail(variables.organizationSlug),
      });

      await queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });

      notificationService.success('Organization archived');

      navigate(RoutePaths.APP, {
        replace: true,
      });
    },
    onError: (error) => {
      notificationService.error('Failed to archive organization', {
        description: error.message,
      });
    },
  });

  return {
    archiveOrganization: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useCreateOrganization = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setCurrentOrganization = useSetCurrentOrganization();

  const mutation = useMutation({
    mutationFn: create,
    onSuccess: async (organization) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
      setCurrentOrganization(organization);
      notificationService.success('Organizaiton created', {
        description: 'Your organization has been created successfully.',
      });
      navigate(ORGANIZATION_ROUTES.DASHBOARD(organization.slug));
    },
    onError: (error) => {
      notificationService.error('Failed to create organization', {
        description: error.message,
      });
    },
  });

  return {
    createOrganization: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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

      notificationService.success('Invitation sent');
    },
    onError: (error) => {
      notificationService.error('Unable to send invitation', {
        description: error.message,
      });
    },
  });

  return {
    inviteMember: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

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

export const useRemoveMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
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
      notificationService.success('Member removed', {
        description: 'The member has been removed from the organization.',
      });
    },
    onError: (error) => {
      notificationService.error('Failed to remove member', {
        description: error.message,
      });
    },
  });

  return {
    isPending: mutation.isPending,
    removeMember: mutation.mutateAsync,
  };
};

export const useRestoreOrganization = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ organizationSlug }: { organizationSlug: string }) =>
      restore(organizationSlug),
    onSuccess: (_, variables) => {
      queryClient.removeQueries({
        queryKey: organizationsKeys.detail(variables.organizationSlug),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });

      notificationService.success('Organization restored', {
        description: 'The organization is active again.',
      });

      navigate(ORGANIZATION_ROUTES.SETTINGS(variables.organizationSlug), {
        replace: true,
      });
    },
    onError: (error) => {
      notificationService.error('Failed to restore organization', {
        description: error.message,
      });
    },
  });

  return {
    restoreOrganization: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

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

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      userId,
      payload,
      organizationSlug,
    }: {
      userId: string;
      organizationSlug: string;
      payload: UpdateMemberRolesRequest;
    }) => updateMemberRoles(organizationSlug, userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.members(variables.organizationSlug),
      });
      notificationService.success('Member role updated', {
        description: 'The member role has been updated.',
      });
    },
    onError: (error) => {
      notificationService.error('Failed to update member role', {
        description: error.message,
      });
    },
  });

  return {
    isPending: mutation.isPending,
    updateMemberRole: mutation.mutateAsync,
  };
};

export const useUpdateOrganization = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      organizationSlug,
      payload,
    }: {
      organizationSlug: string;
      payload: UpdateOrganizationRequest;
    }) => update(organizationSlug, payload),
    onSuccess: (organization, variables) => {
      queryClient.setQueryData(
        organizationsKeys.detail(variables.organizationSlug),
        organization,
      );
      queryClient.setQueryData(
        organizationsKeys.lists(),
        (response: ApiResponse<OrganizationSummary[]> | undefined) => {
          return response?.data?.map((item) =>
            item.id === organization.id
              ? {
                  ...item,
                  name: organization.name,
                  slug: organization.slug,
                  description: organization.description,
                  logoUrl: organization.logoUrl,
                }
              : item,
          );
        },
      );
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });

      notificationService.success('Organization Updated', {
        description: 'Changes saved successfully.',
      });

      if (variables.organizationSlug === organization.slug) {
        navigate(ORGANIZATION_ROUTES.SETTINGS(organization.slug), {
          replace: true,
        });
      }
    },
    onError: (error) => {
      notificationService.error('Failed to update organization', {
        description: error.message,
      });
    },
  });

  return {
    updateOrganization: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
};

// export const useAcceptInvitation = () => {
//   const mutation = useMutation({
//     mutationFn: acceptInvitation,
//     onSuccess: () => {
//       notificationService.success('Invitation accepted');
//     },
//   });

//   return {
//     acceptInvitation: mutation.mutateAsync,
//     isPending: mutation.isPending,
//   };
// };

// export const useDeclineInvitation = () => {
//   const mutation = useMutation({
//     mutationFn: declineInvitation,
//     onSuccess: () => {
//       notificationService.success('Invitation declined');
//     },
//   });

//   return {
//     declineInvitation: mutation.mutateAsync,
//     isPending: mutation.isPending,
//   };
// };

export const useInvitationActions = () => {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: ({ invitationId }: InvitationActionVariables) =>
      acceptInvitation(invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.invitations(variables.organizationSlug),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.members(variables.organizationSlug),
      });

      notificationService.success('Invitation accepted', {
        description: 'The invitation has been accepted successfully.',
      });
    },

    onError: (error: Error, variables, context) => {
      queryClient.setQueryData(
        organizationsKeys.invitations(variables.organizationSlug),
        context?.previous,
      );
      notificationService.error('Unable to accept invitation', {
        description: error.message,
      });
    },
    onMutate: async ({
      invitationId,
      organizationSlug,
    }: InvitationActionVariables) => {
      await queryClient.cancelQueries({
        queryKey: organizationsKeys.invitations(organizationSlug),
      });
      const previous = queryClient.getQueryData(
        organizationsKeys.invitations(organizationSlug),
      );

      queryClient.setQueryData(
        organizationsKeys.invitations(organizationSlug),
        (invitations: OrganizationInvitation[] = []) =>
          invitations.filter((invitation) => invitation.id !== invitationId),
      );

      return { previous };
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ invitationId }: InvitationActionVariables) =>
      declineInvitation(invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.invitations(variables.organizationSlug),
      });
      notificationService.success('Invitation declined', {
        description: 'The invitation has been declined.',
      });
    },
    onError: (error: Error, variables, context) => {
      queryClient.setQueryData(
        organizationsKeys.invitations(variables.organizationSlug),
        context?.previous,
      );
      notificationService.error('Unable to decline invitation', {
        description: error.message,
      });
    },
    onMutate: async ({
      invitationId,
      organizationSlug,
    }: InvitationActionVariables) => {
      await queryClient.cancelQueries({
        queryKey: organizationsKeys.invitations(organizationSlug),
      });
      const previous = queryClient.getQueryData(
        organizationsKeys.invitations(organizationSlug),
      );

      queryClient.setQueryData(
        organizationsKeys.invitations(organizationSlug),
        (invitations: OrganizationInvitation[] = []) =>
          invitations.filter((invitation) => invitation.id !== invitationId),
      );

      return { previous };
    },
  });

  return {
    acceptInvitation: acceptMutation.mutateAsync,
    declineInvitation: declineMutation.mutateAsync,
    isAccepting: acceptMutation.isPending,
    isDeclining: declineMutation.isPending,
  };
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      invitationId,
    }: InvitationActionVariables) =>
      revokeInvitation(organizationSlug, invitationId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: organizationsKeys.invitations(variables.organizationSlug),
      });
      const previous = queryClient.getQueryData<OrganizationInvitation[]>(
        organizationsKeys.invitations(variables.organizationSlug),
      );

      queryClient.setQueryData(
        organizationsKeys.invitations(variables.organizationSlug),
        (invitations: ApiResponse<OrganizationInvitation[]>) =>
          invitations.data.filter(
            (invitation) => invitation.id !== variables.invitationId,
          ),
      );

      return { previous };
    },

    onError: (error: Error, variables, context) => {
      queryClient.setQueryData(
        organizationsKeys.invitations(variables.organizationSlug),
        context?.previous,
      );
      notificationService.error('Unabl to revoke invitation', {
        description: error.message,
      });
    },
    onSuccess: () => {
      notificationService.success('Invitation revoked', {
        description: 'The invitation has been revoked successfully.',
      });
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.invitations(variables.organizationSlug),
      });
    },
  });
};
