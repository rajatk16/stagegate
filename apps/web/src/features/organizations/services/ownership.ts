import { User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

import { isRecord } from '@/app/utils';
import { ApiError, authenticatedApiRequest } from '@/lib';

import { matchesMembership } from '../utils';
import { ORGANIZATION_ROLES } from '../types';

export const transferOrganizationOwnership = async (
  user: User,
  organizationId: string,
  targetUid: string,
  signal: AbortSignal,
): Promise<void> => {
  const result = await authenticatedApiRequest(
    user,
    `/organizations/${encodeURIComponent(organizationId)}/ownership/transfer`,
    {
      method: 'POST',
      json: { targetUid },
      signal,
    },
  );

  if (
    !isRecord(result) ||
    result.organizationId !== organizationId ||
    !matchesMembership(
      result.previousOwner,
      user.uid,
      ORGANIZATION_ROLES.ADMIN,
    ) ||
    !matchesMembership(result.newOwner, targetUid, ORGANIZATION_ROLES.OWNER)
  ) {
    throw new ApiError(
      'The API returned an unexpected ownership transfer.',
      'response',
    );
  }
};

export const getOwnershipTransferError = (
  error: unknown,
  submitted: boolean,
): string => {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/too-many-requests') {
      return 'Too many verification attempts. Wait before trying again.';
    }

    if (error.code === 'auth/network-request-failed') {
      return 'Account verification could not reach Firebase. Check your connection.';
    }

    return 'Your account could not be verified. Check your password and try again.';
  }

  if (error instanceof ApiError) {
    switch (error.code) {
      case 'AUTH_RECENT_LOGIN_REQUIRED':
        return 'Recent authentication is required. Verify your account again.';
      case 'AUTH_EMAIL_NOT_VERIFIED':
        return 'Verify your email before transferring ownership.';
      case 'ORGANIZATION_SELF_TRANSFER_FORBIDDEN':
        return 'Choose another organization member.';
      case 'ORGANIZATION_TARGET_ALREADY_OWNER':
        return 'This member is already an owner.';
      case 'ORGANIZATION_MEMBER_NOT_FOUND':
        return 'This person is no longer a member.';
      case 'ORGANIZATION_MEMBERSHIP_INACTIVE':
        return 'Your membership or the selected membership is no longer active.';
      case 'ORGANIZATION_OWNER_REQUIRED':
      case 'ORGANIZATION_PERMISSION_DENIED':
        return 'You no longer have permission to transfer ownership.';
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again.';
    }

    if (error.status === 429) {
      return 'Too many transfer attempts. Wait before trying again.';
    }

    if (error.status === 403 || error.status === 404) {
      return 'The organization or your permissions have changed.';
    }

    if (error.status === 400) {
      return 'The transfer request is no longer valid.';
    }
  }

  return submitted
    ? 'We could not confirm whether ownership transferred. Check the current roles and activity before retrying.'
    : 'Account verification failed. No transfer request was sent.';
};
