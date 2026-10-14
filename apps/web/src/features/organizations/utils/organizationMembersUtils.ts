import {
  ORGANIZATION_ROLES,
  OrganizationMember,
  OrganizationMembersPage,
  ORGANIZATION_MEMBERSHIP_STATUSES,
} from '../types';

import { ApiError } from '@/lib';
import { isDateString, isNullableString, isRecord } from '@/app/utils';

export const isMembershipStatus = (
  value: unknown,
): value is ORGANIZATION_MEMBERSHIP_STATUSES =>
  Object.values(ORGANIZATION_MEMBERSHIP_STATUSES).includes(
    value as ORGANIZATION_MEMBERSHIP_STATUSES,
  );

export const isOrganizationRole = (
  value: unknown,
): value is ORGANIZATION_ROLES =>
  typeof value === 'string' &&
  Object.values(ORGANIZATION_ROLES).includes(value as ORGANIZATION_ROLES);

const parseMember = (value: unknown): OrganizationMember => {
  if (
    !isRecord(value) ||
    typeof value.uid !== 'string' ||
    value.uid.trim().length === 0 ||
    value.uid.length > 128 ||
    !isNullableString(value.displayName) ||
    !isNullableString(value.email) ||
    !isOrganizationRole(value.role) ||
    !isMembershipStatus(value.status) ||
    !isDateString(value.createdAt) ||
    !isDateString(value.updatedAt) ||
    !isRecord(value.actions) ||
    typeof value.actions.suspend !== 'boolean' ||
    typeof value.actions.reactivate !== 'boolean'
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
    actions: {
      suspend: value.actions.suspend,
      reactivate: value.actions.reactivate,
    },
  };
};

export const parseMembersPage = (value: unknown): OrganizationMembersPage => {
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
