import { ApiError } from '@/lib';
import { UUID_PATTERN } from '../constants';
import { INVITATION_ROLES, OrganizationInvitation } from '../types';
import { isRecord } from '@/app/utils';

export const isInvitationRole = (value: unknown): value is INVITATION_ROLES =>
  typeof value === 'string' &&
  Object.values(INVITATION_ROLES).includes(value as INVITATION_ROLES);

export const parseInvitation = (
  value: unknown,
  organizationId: string,
): OrganizationInvitation => {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !UUID_PATTERN.test(value.id) ||
    value.organizationId !== organizationId ||
    typeof value.recipientEmail !== 'string' ||
    value.recipientEmail.trim().length === 0 ||
    !isInvitationRole(value.role) ||
    value.status !== 'PENDING' ||
    typeof value.expiresAt !== 'string' ||
    !Number.isFinite(Date.parse(value.expiresAt))
  ) {
    throw new ApiError(
      'The API returned an unexpected invitation response',
      'response',
    );
  }

  return {
    id: value.id,
    organizationId,
    recipientEmail: value.recipientEmail,
    role: value.role,
    status: value.status,
    expiresAt: value.expiresAt,
  };
};

export const getInvitationErrorMessage = (
  error: unknown,
  action: 'read' | 'write' = 'read',
): string => {
  if (error instanceof ApiError) {
    if (error.code === 'AUTH_EMAIL_NOT_VERIFIED') {
      return 'Verify your email address before creating or revoking invitations.';
    }

    if (error.code === 'ORGANIZATION_INVITATION_EMAIL_UNCONFIRMED') {
      return 'Email delivery could not be confirmed. Refresh pending invitations before trying again.';
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again.';
    }

    if (error.status === 403) {
      return 'Your permissions may have changed. Refresh access before continuing.';
    }

    if (error.status === 404) {
      return 'The organization or invitation is no longer available. Refresh to check.';
    }

    if (error.status === 409) {
      return 'The invitation has already changed, possibly because it was accepted. Refresh the list.';
    }

    if (error.status === 400) {
      return action === 'read'
        ? 'This page is no longer available. Refresh invitations to start again.'
        : 'Check the email address and selected role.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment before trying again.';
    }
  }

  return action === 'read'
    ? 'Could not load invitations. Please try again.'
    : 'We could not confirm the result. Refresh pending invitations before retrying.';
};
