import { User } from 'firebase/auth';
import {
  CreateInvitationInput,
  InvitationPage,
  PendingInvitation,
} from '../types';
import { ApiError, authenticatedApiRequest } from '@/lib';
import { isRecord } from './organization';
import { UUID_PATTERN } from '../constants';
import {
  isInvitationRole,
  parseInvitation,
} from '../utils/organizationInvitationUtils';

const invitationPath = (organizationId: string) =>
  `/organizations/${encodeURIComponent(organizationId)}/invitations`;

export const listOrganizationInvitations = async (
  user: User,
  organizationId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<InvitationPage> => {
  const query = new URLSearchParams();

  if (cursor !== null) query.set('cursor', cursor);

  const suffix = query.size > 0 ? `?${query.toString()}` : '';

  const result = await authenticatedApiRequest(
    user,
    `${invitationPath(organizationId)}${suffix}`,
    { signal },
  );

  if (
    !isRecord(result) ||
    !Array.isArray(result.items) ||
    !Array.isArray(result.allowedRoles) ||
    !result.allowedRoles.every(isInvitationRole) ||
    (result.nextCursor !== null &&
      (typeof result.nextCursor !== 'string' ||
        !UUID_PATTERN.test(result.nextCursor))) ||
    (result.items.length === 0 && result.nextCursor !== null) ||
    (cursor !== null && result.nextCursor === cursor)
  ) {
    throw new ApiError(
      'The API returned an unexpected invitation response',
      'response',
    );
  }

  const items = result.items.map((value): PendingInvitation => {
    const invitation = parseInvitation(value, organizationId);

    if (!isRecord(value) || typeof value.canRevoke !== 'boolean') {
      throw new ApiError(
        'The API returned an unexpected invitation response',
        'response',
      );
    }

    return {
      ...invitation,
      canRevoke: value.canRevoke,
    };
  });

  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new ApiError('The API returned duplicate invitation IDs', 'response');
  }

  return {
    items,
    nextCursor: result.nextCursor,
    allowedRoles: [...new Set(result.allowedRoles)],
  };
};

export const createOrganizationInvitation = async (
  user: User,
  organizationId: string,
  input: CreateInvitationInput,
  signal: AbortSignal,
): Promise<'ACCEPTED' | 'CAPTURED'> => {
  const result = await authenticatedApiRequest(
    user,
    invitationPath(organizationId),
    {
      method: 'POST',
      json: {
        email: input.email.trim().toLowerCase(),
        role: input.role,
      },
      signal,
      timeoutMs: 30_000,
    },
  );

  parseInvitation(result, organizationId);

  if (
    !isRecord(result) ||
    (result.emailStatus !== 'ACCEPTED' && result.emailStatus !== 'CAPTURED')
  ) {
    throw new ApiError(
      'The API returned an unexpected invitation response',
      'response',
    );
  }

  return result.emailStatus;
};

export const revokeOrganizationInvitation = async (
  user: User,
  organizationId: string,
  invitationId: string,
  signal: AbortSignal,
): Promise<void> => {
  await authenticatedApiRequest(
    user,
    `${invitationPath(organizationId)}/${encodeURIComponent(invitationId)}`,
    {
      method: 'DELETE',
      signal,
    },
  );
};
