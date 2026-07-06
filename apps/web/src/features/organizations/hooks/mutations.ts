import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RoutePaths } from '@/app';
import { notificationService, type ApiResponse } from '@/lib';

import { ORGANIZATION_ROUTES } from '../constants';
import { useSetCurrentOrganization } from './useCurrentOrganization';
import type {
  OrganizationSummary,
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
  leaveOrganization,
  organizationsKeys,
  transferOwnership,
  updateMemberRoles,
} from '../api';

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
