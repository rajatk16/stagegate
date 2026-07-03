import { httpClient, type ApiResponse } from '@/lib';

import type {
  OrganizationMember,
  OrganizationDetails,
  OrganizationSummary,
  OrganizationInvitation,
  UpdateMemberRolesRequest,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  CreateOrganizationResponse,
  CreateOrganizationInvitationRequest,
  TransferOrganizationOwnershipRequest,
} from '../types';

const ENDPOINTS = {
  organizations: '/organizations',
  organization: (slug: string) => `/organizations/${slug}`,
  archiveOrganization: (slug: string) => `/organizations/${slug}/archive`,
  restoreOrganization: (slug: string) => `/organizations/${slug}/restore`,
  members: (slug: string) => `/organizations/${slug}/members`,
  currentMember: (slug: string) => `/organizations/${slug}/members/me`,
  invitations: (slug: string) => `/organizations/${slug}/members/invitations`,
  member: (slug: string, userId: string) =>
    `/organizations/${slug}/members/${userId}`,
  removeMember: (slug: string, userId: string) =>
    `/organizations/${slug}/members/${userId}/remove`,
  leaveOrganization: (slug: string) => `/organizations/${slug}/members/leave`,
  transferOwnership: (slug: string) =>
    `/organizations/${slug}/ownership/transfer`,
  acceptInvitation: (invitationId: string) =>
    `/organization-invitations/${invitationId}/accept`,
  declineInvitation: (invitationId: string) =>
    `/organization-invitations/${invitationId}/decline`,
};

export const list = async (): Promise<ApiResponse<OrganizationSummary[]>> =>
  httpClient.get<ApiResponse<OrganizationSummary[]>>(ENDPOINTS.organizations);

export const get = async (slug: string): Promise<OrganizationDetails> =>
  httpClient.get<OrganizationDetails>(ENDPOINTS.organization(slug));

export const create = async (
  payload: CreateOrganizationRequest,
): Promise<CreateOrganizationResponse> =>
  httpClient.post<CreateOrganizationResponse, CreateOrganizationRequest>(
    ENDPOINTS.organizations,
    payload,
  );

export const update = async (
  organizationSlug: string,
  payload: UpdateOrganizationRequest,
): Promise<OrganizationDetails> =>
  httpClient.patch<OrganizationDetails, UpdateOrganizationRequest>(
    ENDPOINTS.organization(organizationSlug),
    payload,
  );

export const archive = async (organizationSlug: string): Promise<void> =>
  httpClient.patch<void, void>(
    ENDPOINTS.archiveOrganization(organizationSlug),
    undefined,
  );

export const restore = async (organizationSlug: string): Promise<void> =>
  httpClient.patch<void, void>(
    ENDPOINTS.restoreOrganization(organizationSlug),
    undefined,
  );

export const getMembers = async (
  organizationSlug: string,
): Promise<OrganizationMember[]> =>
  httpClient.get<OrganizationMember[]>(ENDPOINTS.members(organizationSlug));

export const getCurrentMember = async (
  organizationSlug: string,
): Promise<OrganizationMember> =>
  httpClient.get<OrganizationMember>(ENDPOINTS.currentMember(organizationSlug));

export const inviteMember = async (
  organizationSlug: string,
  payload: CreateOrganizationInvitationRequest,
): Promise<OrganizationInvitation> =>
  httpClient.post<OrganizationInvitation, CreateOrganizationInvitationRequest>(
    ENDPOINTS.invitations(organizationSlug),
    payload,
  );

export const updateMemberRoles = async (
  organizationSlug: string,
  userId: string,
  payload: UpdateMemberRolesRequest,
): Promise<OrganizationMember> =>
  httpClient.patch<OrganizationMember, UpdateMemberRolesRequest>(
    ENDPOINTS.member(organizationSlug, userId),
    payload,
  );

export const removeMember = async (
  organizationSlug: string,
  userId: string,
): Promise<OrganizationMember> =>
  httpClient.patch<OrganizationMember, void>(
    ENDPOINTS.removeMember(organizationSlug, userId),
    undefined,
  );

export const leaveOrganization = async (organizationSlug: string) =>
  httpClient.post<void, void>(
    ENDPOINTS.leaveOrganization(organizationSlug),
    undefined,
  );

export const transferOwnership = async (
  organizationSlug: string,
  payload: TransferOrganizationOwnershipRequest,
) =>
  httpClient.patch<OrganizationMember, TransferOrganizationOwnershipRequest>(
    ENDPOINTS.transferOwnership(organizationSlug),
    payload,
  );

export const acceptInvitation = async (invitationId: string) =>
  httpClient.post<void, void>(
    ENDPOINTS.acceptInvitation(invitationId),
    undefined,
  );

export const declineInvitation = async (invitationId: string) =>
  httpClient.post<void, void>(
    ENDPOINTS.declineInvitation(invitationId),
    undefined,
  );

export const organizationsKeys = {
  all: ['organizations'],
  lists: () => [...organizationsKeys.all, 'list'],
  list: () => [...organizationsKeys.lists()],
  details: () => [...organizationsKeys.all, 'detail'],
  detail: (organizationSlug: string) => [
    ...organizationsKeys.details(),
    organizationSlug,
  ],
  members: (organizationSlug: string) => [
    ...organizationsKeys.detail(organizationSlug),
    'members',
  ],
  currentMember: (organizationSlug: string) => [
    ...organizationsKeys.members(organizationSlug),
    'me',
  ],
  invitations: (organizationSlug: string) => [
    ...organizationsKeys.members(organizationSlug),
    'invitations',
  ],
};
