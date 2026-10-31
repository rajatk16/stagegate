import { ApiError } from '@/lib';
import { isRecord } from '@/app/utils';

import { isEventRole } from './eventTeamUtils';
import {
  EventAccess,
  EventMember,
  EventAuthority,
  EventPermission,
  EventMembersPage,
  EventMemberStatus,
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

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isMemberStatus = (value: unknown): value is EventMemberStatus =>
  value === 'ACTIVE' || value === 'SUSPENDED';

const knownPermissions: readonly EventPermission[] = [
  'event:read',
  'event:update',
  'event:members:read',
  'event:manage-status',
  'event:members:manage',
];

const parseAuthority = (value: unknown): EventAuthority => {
  if (!isRecord(value)) {
    throw invalidResponse();
  }

  if (value.kind === 'ORGANIZATION_ADMIN') {
    return {
      kind: 'ORGANIZATION_ADMIN',
    };
  }

  if (value.kind === 'EVENT_MEMBER' && isEventRole(value.role)) {
    return {
      kind: 'EVENT_MEMBER',
      role: value.role,
    };
  }

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
    !isMemberStatus(value.status) ||
    !isDate(value.createdAt) ||
    !isDate(value.updatedAt) ||
    (value.organizationStatus !== undefined &&
      !isMemberStatus(value.organizationStatus)) ||
    (value.effectiveStatus !== undefined &&
      !isMemberStatus(value.effectiveStatus))
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
    ...(value.organizationStatus !== undefined
      ? {
          organizationStatus: value.organizationStatus,
        }
      : {}),
    ...(value.effectiveStatus !== undefined
      ? {
          effectiveStatus: value.effectiveStatus,
        }
      : {}),
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

  if (
    authority.kind === 'EVENT_MEMBER' &&
    permissions.includes('event:members:manage')
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
