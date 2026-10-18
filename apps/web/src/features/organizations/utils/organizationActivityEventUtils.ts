import { ApiError } from '@/lib';
import { isDateString, isNullableString, isRecord } from '@/app/utils';

import { OrganizationActivityEvent } from '../types';

const invalidResponse = () =>
  new ApiError('The API returned an unexpected activity response.', 'response');

export const parseEvent = (
  value: unknown,
  organizationId: string,
): OrganizationActivityEvent => {
  if (
    !isRecord(value) ||
    typeof value.eventId !== 'string' ||
    value.eventId.length === 0 ||
    value.organizationId !== organizationId ||
    typeof value.action !== 'string' ||
    typeof value.actorUid !== 'string' ||
    !isNullableString(value.actorDisplayName) ||
    !isNullableString(value.actorEmail) ||
    !isDateString(value.occurredAt) ||
    value.outcome !== 'succeeded' ||
    !isRecord(value.details)
  ) {
    throw invalidResponse();
  }

  const details: Record<string, string | string[]> = {};

  for (const [key, item] of Object.entries(value.details)) {
    if (typeof item === 'string') {
      details[key] = item;
    } else if (
      Array.isArray(item) &&
      item.every((entry): entry is string => typeof entry === 'string')
    ) {
      details[key] = item;
    } else {
      throw invalidResponse();
    }
  }

  return {
    eventId: value.eventId,
    organizationId,
    action: value.action,
    actorUid: value.actorUid,
    actorDisplayName: value.actorDisplayName?.trim() || null,
    actorEmail: value.actorEmail?.trim() || null,
    occurredAt: value.occurredAt,
    outcome: 'succeeded',
    details,
  };
};

export const getActivityError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.code === 'AUTH_EMAIL_NOT_VERIFIED') {
      return 'Verify your email to view organization activity.';
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again.';
    }

    if (error.status === 403 || error.status === 404) {
      return 'Your access has changed or this organization is unavailable.';
    }

    if (error.status === 400) {
      return 'This activity page is no longer valid. Refresh to start again.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait before trying again.';
    }
  }

  return 'Activity could not be loaded. Please try again.';
};

export const getActivityLabel = (event: OrganizationActivityEvent): string => {
  switch (event.action) {
    case 'organization.created':
      return 'Created the organization';
    case 'organization.settings.updated':
      return 'Updated organization settings';
    case 'organization.member.role.changed':
      return 'Changed a member’s role';
    case 'organization.member.status.changed':
      switch (event.details.nextStatus) {
        case 'SUSPENDED':
          return 'Suspended a member';
        case 'ACTIVE':
          return 'Reactivated a member';
        case 'LEFT':
          return 'Left the organization';
        default:
          return 'Updated a membership';
      }
    case 'organization.invitation.created':
      return 'Created an invitation';
    case 'organization.invitation.accepted':
      return 'Accepted an invitation';
    case 'organization.invitation.revoked':
      return 'Revoked an invitation';
    case 'organization.ownership.transferred':
      return 'Transferred ownership';
    case 'event.created':
      return 'Created an Event';
    default:
      return 'Organization activity';
  }
};
