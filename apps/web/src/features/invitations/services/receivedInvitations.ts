import type { User } from 'firebase/auth';

import { isRecord } from '@/app/utils';
import { isEventRole } from '@/features/events';
import { isOrganizationRole } from '@/features/organizations';
import {
  ApiError,
  INVITATION_ID_PATTERN,
  authenticatedApiRequest,
} from '@/lib';

import { parseAcceptedInvitation } from './acceptInvitation';
import { ReceivedInvitation, ReceivedInvitationsPage } from '../types';

const invalidResponse = () =>
  new ApiError(
    'The API returned an unexpected received-invitations response.',
    'response',
  );

export const listReceivedInvitations = async (
  user: User,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<ReceivedInvitationsPage> => {
  const query = new URLSearchParams();

  if (cursor !== null) query.set('cursor', cursor);

  const suffix = query.size > 0 ? `?${query.toString()}` : '';

  const result = await authenticatedApiRequest(
    user,
    `/invitations/received${suffix}`,
    { signal },
  );

  if (
    !isRecord(result) ||
    !Array.isArray(result.items) ||
    (result.nextCursor !== null &&
      (typeof result.nextCursor !== 'string' ||
        !INVITATION_ID_PATTERN.test(result.nextCursor))) ||
    (cursor !== null && result.nextCursor === cursor)
  ) {
    throw invalidResponse();
  }

  const items = result.items.map((item): ReceivedInvitation => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      !INVITATION_ID_PATTERN.test(item.id) ||
      typeof item.organizationId !== 'string' ||
      !INVITATION_ID_PATTERN.test(item.organizationId) ||
      typeof item.organizationName !== 'string' ||
      !item.organizationName.trim() ||
      typeof item.expiresAt !== 'string' ||
      !Number.isFinite(Date.parse(item.expiresAt))
    ) {
      throw invalidResponse();
    }

    const common = {
      id: item.id,
      organizationId: item.organizationId,
      organizationName: item.organizationName,
      expiresAt: item.expiresAt,
    };

    if (item.scopeType === 'EVENT') {
      if (
        typeof item.eventId !== 'string' ||
        !INVITATION_ID_PATTERN.test(item.eventId) ||
        typeof item.eventName !== 'string' ||
        !item.eventName.trim() ||
        !isEventRole(item.role)
      ) {
        throw invalidResponse();
      }

      return {
        ...common,
        scopeType: 'EVENT',
        eventId: item.eventId,
        eventName: item.eventName,
        role: item.role,
      };
    }

    if (
      item.scopeType !== 'ORGANIZATION' ||
      !isOrganizationRole(item.role) ||
      item.role === 'OWNER'
    ) {
      throw invalidResponse();
    }

    return {
      ...common,
      scopeType: 'ORGANIZATION',
      role: item.role,
    };
  });

  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw invalidResponse();
  }

  return { items, nextCursor: result.nextCursor };
};

export const acceptReceivedInvitation = async (
  user: User,
  invitation: ReceivedInvitation,
  signal: AbortSignal,
) => {
  const response = await authenticatedApiRequest(
    user,
    `/invitations/received/${encodeURIComponent(invitation.id)}/accept`,
    {
      method: 'POST',
      signal,
    },
  );

  const result = parseAcceptedInvitation(response, user.uid);

  if (
    result.scopeType !== invitation.scopeType ||
    result.organizationId !== invitation.organizationId
  ) {
    throw invalidResponse();
  }

  if (
    invitation.scopeType === 'EVENT' &&
    (result.scopeType !== 'EVENT' || result.eventId !== invitation.eventId)
  ) {
    throw invalidResponse();
  }

  return result;
};

export const getReceivedInvitationsError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again.';
    }

    if (error.status === 403) {
      return 'Your account must have a current verified email address to view invitations.';
    }

    if (error.status === 400) {
      return 'This page is no longer available. Refresh invitations to start again.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment before refreshing.';
    }
  }

  return 'Could not load your invitations. Please try again.';
};
