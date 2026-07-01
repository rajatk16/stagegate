import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organizationSlug,
      payload,
    }: {
      organizationSlug: string;
      payload: UpdateOrganizationRequest;
    }) => update(organizationSlug, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.detail(variables.organizationSlug),
      });
      queryClient.invalidateQueries({
        queryKey: organizationsKeys.lists(),
      });
    },
  });
};
