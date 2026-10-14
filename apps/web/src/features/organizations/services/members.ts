import { User } from 'firebase/auth';

import { isDateString, isRecord } from '@/app/utils';
import { ApiError, authenticatedApiRequest } from '@/lib';

import { PAGE_SIZE } from '../constants';
import { isOrganizationRole, parseMembersPage } from '../utils';
import {
  OrganizationMembersPage,
  ORGANIZATION_MEMBERSHIP_STATUSES,
} from '../types';

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

export const changeOrganizationMemberStatus = async (
  user: User,
  organizationId: string,
  uid: string,
  status: ORGANIZATION_MEMBERSHIP_STATUSES,
  signal: AbortSignal,
): Promise<void> => {
  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/members/${encodeURIComponent(uid)}/status`,
    {
      method: 'PATCH',
      json: {
        status,
      },
      signal,
    },
  );

  if (
    !isRecord(result) ||
    result.uid !== uid ||
    result.status !== status ||
    !isOrganizationRole(result.role) ||
    !isDateString(result.createdAt) ||
    !isDateString(result.updatedAt)
  ) {
    throw new ApiError(
      'The API returned an unexpected membership update.',
      'response',
    );
  }
};

export const leaveOrganization = async (
  user: User,
  organizationId: string,
  signal: AbortSignal,
): Promise<void> => {
  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/leave`,
    {
      method: 'POST',
      signal,
    },
  );

  if (result !== undefined) {
    throw new ApiError(
      'The API returned an unexpected leave response.',
      'response',
    );
  }
};

export const getMembershipLifecycleErrorMessage = (
  error: unknown,
  context: 'member' | 'leave',
): string => {
  if (error instanceof ApiError) {
    if (error.code === 'AUTH_EMAIL_NOT_VERIFIED') {
      return 'Verify your email before changing organization membership.';
    }

    if (error.code === 'ORGANIZATION_LAST_ACTIVE_OWNER') {
      return (
        'The organization must retain an active owner. ' +
        'Another active owner is required before you can leave. ' +
        'Ownership transfer is not available on this screen.'
      );
    }

    if (error.code === 'ORGANIZATION_SELF_STATUS_CHANGE_FORBIDDEN') {
      return 'You cannot suspend yourself. Use Leave organization instead.';
    }

    if (error.code === 'ORGANIZATION_MEMBER_STATUS_CHANGE_FORBIDDEN') {
      return 'You cannot change this member’s status. Close this dialog and refresh the team.';
    }

    if (error.code === 'ORGANIZATION_MEMBERSHIP_INACTIVE') {
      return 'Your membership is suspended. An authorized member must reactivate it before you can continue.';
    }

    if (error.code === 'ORGANIZATION_MEMBER_NOT_FOUND') {
      return 'This person is no longer a member. Close this dialog and refresh the team.';
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again before continuing.';
    }

    if (error.status === 403 || error.status === 404) {
      return 'Your organization access may have changed. Close this dialog and refresh access.';
    }

    if (error.status === 400) {
      return 'This request is no longer valid. Close this dialog and refresh before trying again.';
    }

    if (error.status === 429) {
      return 'Too many attempts. Wait a moment before trying again.';
    }
  }

  // A timeout or lost response does not prove that the write failed.
  return context === 'leave'
    ? 'We could not confirm whether you left. Close this dialog and refresh access before trying again.'
    : 'We could not confirm the membership change. Close this dialog and refresh the team before trying again.';
};

export const getOrganizationMembersErrorMessage = (error: unknown): string => {
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
