import { User } from 'firebase/auth';

import { ApiError, authenticatedApiRequest } from '@/lib';

import {
  parseEventAccess,
  parseEventMember,
  parseEventMembersPage,
  parseEventInvitationsPage,
  parseCreatedEventInvitation,
} from '../utils';
import {
  EventRole,
  EventAccess,
  EventMember,
  EventMembersPage,
  EventMemberStatus,
  EventInvitationsPage,
  CreatedEventInvitation,
  CreateEventInvitationInput,
} from '../types';

const eventPath = (organizationId: string, eventId: string): string =>
  `/organizations/${encodeURIComponent(organizationId)}/events/${encodeURIComponent(eventId)}`;

export const getEventAccess = async (
  user: User,
  organizationId: string,
  eventId: string,
  signal: AbortSignal,
): Promise<EventAccess> => {
  const result = await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/membership`,
    { signal },
  );

  return parseEventAccess(result, organizationId, eventId, user.uid);
};

export const listEventMembers = async (
  user: User,
  organizationId: string,
  eventId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<EventMembersPage> => {
  const query = new URLSearchParams({ limit: '20' });

  if (cursor !== null) query.set('cursor', cursor);

  const result = await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/members?${query}`,
    { signal },
  );

  return parseEventMembersPage(result, organizationId, eventId);
};

export const updateEventMemberRole = async (
  user: User,
  organizationId: string,
  eventId: string,
  uid: string,
  role: EventRole,
  signal: AbortSignal,
): Promise<EventMember> => {
  const result = await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/members/${encodeURIComponent(uid)}/role`,
    {
      method: 'PATCH',
      json: { role },
      signal,
    },
  );

  const member = parseEventMember(result, organizationId, eventId);

  if (member.uid !== uid || member.role !== role) {
    throw new ApiError(
      'The API returned an unexpected role update.',
      'response',
    );
  }
  return member;
};

export const updateEventMemberStatus = async (
  user: User,
  organizationId: string,
  eventId: string,
  uid: string,
  status: EventMemberStatus,
  signal: AbortSignal,
): Promise<EventMember> => {
  const result = await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/members/${encodeURIComponent(uid)}/status`,
    {
      method: 'PATCH',
      json: { status },
      signal,
    },
  );

  const member = parseEventMember(result, organizationId, eventId);

  if (member.uid !== uid || member.status !== status) {
    throw new ApiError(
      'The API returned an unexpected status update.',
      'response',
    );
  }

  return member;
};

export const listEventInvitations = async (
  user: User,
  organizationId: string,
  eventId: string,
  signal: AbortSignal,
  cursor: string | null = null,
): Promise<EventInvitationsPage> => {
  const query = new URLSearchParams();

  if (cursor !== null) query.set('cursor', cursor);

  const suffix = query.size > 0 ? `?${query}` : '';

  const result = await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/invitations${suffix}`,
    { signal },
  );

  return parseEventInvitationsPage(result, organizationId, eventId);
};

export const createEventInvitation = async (
  user: User,
  organizationId: string,
  eventId: string,
  input: CreateEventInvitationInput,
  signal: AbortSignal,
): Promise<CreatedEventInvitation> => {
  const result = await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/invitations`,
    {
      method: 'POST',
      json: {
        email: input.email.trim().toLowerCase(),
        role: input.role,
      },
      signal,
    },
  );

  const invitation = parseCreatedEventInvitation(
    result,
    organizationId,
    eventId,
  );

  if (
    invitation.recipientEmail !== input.email.trim().toLowerCase() ||
    invitation.role !== input.role
  ) {
    throw new ApiError(
      'The API returned an unexpected invitation.',
      'response',
    );
  }

  return invitation;
};

export const revokeEventInvitation = async (
  user: User,
  organizationId: string,
  eventId: string,
  invitationId: string,
  signal: AbortSignal,
): Promise<void> => {
  await authenticatedApiRequest(
    user,
    `${eventPath(organizationId, eventId)}/invitations/${encodeURIComponent(invitationId)}`,
    {
      method: 'DELETE',
      signal,
    },
  );
};
