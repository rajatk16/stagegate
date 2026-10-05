import { User } from 'firebase/auth';

import { ApiError, authenticatedApiRequest } from '@/lib';

import { isOrganizationRole, isRecord, OrganizationRole } from './organization';

export type OrganizationMembershipStatus = 'ACTIVE';

export type OrganizationMember = {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: OrganizationRole;
  status: OrganizationMembershipStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationMembersPage = {
  items: OrganizationMember[];
  nextCursor: string | null;
};

const PAGE_SIZE = 20;

const isDateString = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

const parseMember = (value: unknown): OrganizationMember => {
  if (
    !isRecord(value) ||
    typeof value.uid !== 'string' ||
    value.uid.trim().length === 0 ||
    value.uid.length > 128 ||
    !isNullableString(value.displayName) ||
    !isNullableString(value.email) ||
    !isOrganizationRole(value.role) ||
    value.status !== 'ACTIVE' ||
    !isDateString(value.createdAt) ||
    !isDateString(value.updatedAt)
  ) {
    throw new ApiError(
      'The API returned an unexpected organization member.',
      'response',
    );
  }

  return {
    uid: value.uid,
    displayName: value.displayName?.trim() || null,
    email: value.email?.trim() || null,
    role: value.role,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
};

const parseMembersPage = (value: unknown): OrganizationMembersPage => {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new ApiError(
      'The API returned an unexpected member list.',
      'response',
    );
  }

  const nextCursor = value.nextCursor;

  if (
    nextCursor !== null &&
    (typeof nextCursor !== 'string' ||
      nextCursor.length > 4096 ||
      !/^[A-Za-z0-9_-]+$/.test(nextCursor))
  ) {
    throw new ApiError(
      'The API returned an unexpected member cursor',
      'response',
    );
  }

  if (value.items.length === 0 && nextCursor !== null) {
    throw new ApiError(
      'The API returned an empty page with more members available.',
      'response',
    );
  }

  return {
    items: value.items.map(parseMember),
    nextCursor,
  };
};

export const listOrganizationMembers = async (
  user: User,
  organizationId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<OrganizationMembersPage> => {
  const query = new URLSearchParams({
    limit: String(PAGE_SIZE),
  });

  if (cursor !== null) {
    query.set('cursor', cursor);
  }

  const response = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/members?${query.toString()}`,
    { signal },
  );

  return parseMembersPage(response);
};

export const getOrganzationMembersErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return 'We could not load the organization team. Please try again.';
  }

  if (error.status === 401) {
    return 'Your session could not be verified. Sign out and sign in again if this continues.';
  }

  if (error.status === 403) {
    return 'You no longer have permission to view this organization’s team.';
  }

  if (error.status === 404) {
    return 'This organization is no longer available to you.';
  }

  if (error.status === 400) {
    return 'This page request is no longer valid. Refresh the list to start again.';
  }

  if (error.status === 429) {
    return 'Too many requests. Wait a moment before trying again.';
  }

  if (error.kind === 'timeout') {
    return 'Loading the team took too long. Please try again.';
  }

  if (error.kind === 'network') {
    return 'We could not reach the server. Check your connection and try again.';
  }

  if (error.kind === 'response') {
    return 'The server returned an unexpected member list. Refresh to try again.';
  }

  return 'We could not load the organization team. Please try again.';
};
