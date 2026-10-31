import { isRecord } from '@/app/utils';
import { ApiError, INVITATION_ID_PATTERN } from '@/lib';

import { isEventRole } from './eventTeamUtils';
import {
  EventAccess,
  EventMember,
  EventAuthority,
  EventInvitation,
  EventPermission,
  EventMembersPage,
  EventInvitationsPage,
  CreatedEventInvitation,
} from '../types';

const invalidResponse = () =>
  new ApiError(
    'The API returned an unexpected event team response.',
    'response',
  );

const isUid = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 128;

const isDate = (value: unknown): value is string =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && INVITATION_ID_PATTERN.test(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const knownPermissions: readonly EventPermission[] = [
  'event:read',
  'event:update',
  'event:members:read',
  'event:manage-status',
  'event:members:manage',
];

const parseAuthority = (value: unknown): EventAuthority => {
  if (!isRecord(value)) throw invalidResponse();

  if (value.kind === 'ORGANIZATION_ADMIN') return { kind: value.kind };

  if (value.kind === 'ORGANIZATION_READER') return { kind: value.kind };

  if (value.kind === 'EVENT_MEMBER' && isEventRole(value.role))
    return { kind: value.kind, role: value.role };

  throw invalidResponse();
};

export const parseEventMember = (
  value: unknown,
  organizationId: string,
  eventId: string,
): EventMember => {
  if (
    !isRecord(value) ||
    value.organizationId !== organizationId ||
    value.eventId !== eventId ||
    !isUid(value.uid) ||
    !isEventRole(value.role) ||
    (value.status !== 'ACTIVE' && value.status !== 'SUSPENDED') ||
    !isDate(value.createdAt) ||
    !isDate(value.updatedAt)
  ) {
    throw invalidResponse();
  }

  return {
    organizationId,
    eventId,
    uid: value.uid,
    role: value.role,
    status: value.status,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
};

export const parseEventAccess = (
  value: unknown,
  organizationId: string,
  eventId: string,
  expectedUid: string,
): EventAccess => {
  if (!isRecord(value)) {
    throw invalidResponse();
  }

  const rawPermissions = value.permissions;

  if (
    value.organizationId !== organizationId ||
    value.eventId !== eventId ||
    !isStringArray(rawPermissions)
  ) {
    throw invalidResponse();
  }

  const authority = parseAuthority(value.authority);

  const permissions = knownPermissions.filter((permission) =>
    rawPermissions.includes(permission),
  );

  if (!permissions.includes('event:read')) {
    throw invalidResponse();
  }

  const membership =
    value.membership === null
      ? null
      : parseEventMember(value.membership, organizationId, eventId);

  if (membership && membership.uid !== expectedUid) {
    throw invalidResponse();
  }

  if (
    authority.kind === 'EVENT_MEMBER' &&
    (membership === null ||
      membership.status !== 'ACTIVE' ||
      membership.role !== authority.role)
  ) {
    throw invalidResponse();
  }

  return {
    organizationId,
    eventId,
    authority,
    permissions,
    membership,
  };
};

export const parseEventMembersPage = (
  value: unknown,
  organizationId: string,
  eventId: string,
): EventMembersPage => {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    (value.nextCursor !== null && !isUid(value.nextCursor))
  ) {
    throw invalidResponse();
  }

  const items = value.items.map((item) =>
    parseEventMember(item, organizationId, eventId),
  );

  if (new Set(items.map((item) => item.uid)).size !== items.length) {
    throw invalidResponse();
  }

  return { items, nextCursor: value.nextCursor };
};

const parseInvitationFields = (
  value: unknown,
  organizationId: string,
  eventId: string,
): Omit<EventInvitation, 'canRevoke'> => {
  if (
    !isRecord(value) ||
    !isUuid(value.id) ||
    value.organizationId !== organizationId ||
    value.eventId !== eventId ||
    typeof value.recipientEmail !== 'string' ||
    value.recipientEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.recipientEmail) ||
    !isEventRole(value.role) ||
    value.status !== 'PENDING' ||
    !isDate(value.expiresAt)
  ) {
    throw invalidResponse();
  }

  return {
    id: value.id,
    organizationId,
    eventId,
    recipientEmail: value.recipientEmail,
    role: value.role,
    status: value.status,
    expiresAt: value.expiresAt,
  };
};

export const parseEventInvitation = (
  value: unknown,
  organizationId: string,
  eventId: string,
): EventInvitation => {
  const invitation = parseInvitationFields(value, organizationId, eventId);

  if (!isRecord(value) || typeof value.canRevoke !== 'boolean') {
    throw invalidResponse();
  }

  return { ...invitation, canRevoke: value.canRevoke };
};

export const parseEventInvitationsPage = (
  value: unknown,
  organizationId: string,
  eventId: string,
): EventInvitationsPage => {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    (value.nextCursor !== null && !isUuid(value.nextCursor))
  ) {
    throw invalidResponse();
  }

  const items = value.items.map((item) =>
    parseEventInvitation(item, organizationId, eventId),
  );

  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw invalidResponse();
  }

  return { items, nextCursor: value.nextCursor };
};

export const parseCreatedEventInvitation = (
  value: unknown,
  organizationId: string,
  eventId: string,
): CreatedEventInvitation => {
  const invitation = parseInvitationFields(value, organizationId, eventId);

  if (
    !isRecord(value) ||
    value.scopeType !== 'EVENT' ||
    (value.emailStatus !== 'ACCEPTED' && value.emailStatus !== 'CAPTURED')
  ) {
    throw invalidResponse();
  }

  return {
    ...invitation,
    scopeType: value.scopeType,
    emailStatus: value.emailStatus,
  };
};
