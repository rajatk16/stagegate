import { Temporal } from '@js-temporal/polyfill';

import { ApiError } from '@/lib';
import { isRecord } from '@/app/utils';

import { parseEvent } from './eventUtils';
import { EventFormat, EventSettings } from '../types';
import { isEventEndAfterStart, isValidEventTimezone } from './eventTimeUtils';

const isNullableText = (
  value: unknown,
  maximumLength: number,
): value is string | null =>
  value === null ||
  (typeof value === 'string' &&
    Array.from(value.trim()).length <= maximumLength);

const isEventFormat = (value: unknown): value is EventFormat | null =>
  value === null ||
  value === 'IN_PERSON' ||
  value === 'ONLINE' ||
  value === 'HYBRID';

const isNullableInstant = (value: unknown): value is string | null => {
  if (value === null) return true;
  if (typeof value !== 'string') return false;

  try {
    Temporal.Instant.from(value);
    return true;
  } catch {
    return false;
  }
};

const invalidSettingsResponse = (): ApiError =>
  new ApiError(
    'The API returned an unexpected event settings response.',
    'response',
  );

export const parseEventSettings = (
  value: unknown,
  organizationId: string,
  eventId: string,
): EventSettings => {
  const summary = parseEvent(value, organizationId);

  if (
    !isRecord(value) ||
    summary.id !== eventId ||
    !isNullableText(value.description, 5_000) ||
    !isEventFormat(value.format) ||
    !isNullableText(value.location, 500) ||
    !isNullableInstant(value.startsAt) ||
    !isNullableInstant(value.endsAt) ||
    !isNullableInstant(value.submissionOpensAt) ||
    !isNullableInstant(value.submissionClosesAt) ||
    !isNullableText(value.submissionInstructions, 10_000) ||
    !(
      value.maxSubmissionsPerPerson === null ||
      (typeof value.maxSubmissionsPerPerson === 'number' &&
        Number.isSafeInteger(value.maxSubmissionsPerPerson) &&
        value.maxSubmissionsPerPerson >= 1)
    ) ||
    typeof value.timezone !== 'string' ||
    !isValidEventTimezone(value.timezone)
  ) {
    throw invalidSettingsResponse();
  }

  const startsAt = value.startsAt;
  const endsAt = value.endsAt;
  const submissionOpensAt = value.submissionOpensAt;
  const submissionClosesAt = value.submissionClosesAt;

  if (
    (submissionOpensAt === null) !== (submissionClosesAt === null) ||
    (submissionOpensAt !== null &&
      submissionClosesAt !== null &&
      !isEventEndAfterStart(submissionOpensAt, submissionClosesAt))
  ) {
    throw invalidSettingsResponse();
  }

  if ((startsAt === null) !== (endsAt === null)) {
    throw invalidSettingsResponse();
  }

  if (
    startsAt !== null &&
    endsAt !== null &&
    !isEventEndAfterStart(startsAt, endsAt)
  ) {
    throw invalidSettingsResponse();
  }

  return {
    ...summary,
    description: value.description,
    format: value.format,
    location: value.location,
    startsAt,
    endsAt,
    timezone: value.timezone,
    submissionOpensAt,
    submissionClosesAt,
    submissionInstructions: value.submissionInstructions,
    maxSubmissionsPerPerson: value.maxSubmissionsPerPerson,
  };
};

export const isEventSettingsSaveUncertain = (error: unknown): boolean =>
  !(error instanceof ApiError) ||
  error.kind === 'network' ||
  error.kind === 'timeout' ||
  error.kind === 'response' ||
  (error.status !== undefined && error.status >= 500);

export const getEventSettingsError = (
  error: unknown,
  operation: 'load' | 'save',
): string => {
  if (error instanceof ApiError) {
    if (error.code === 'AUTH_EMAIL_NOT_VERIFIED') {
      return 'Verify your email before updating event settings.';
    }

    if (error.status === 401) {
      return 'Your session could not be verified. Sign in again.';
    }

    if (error.status === 403 || error.status === 404) {
      return 'This event is unavailable or your access has changed. Refresh access before continuing.';
    }

    if (error.status === 400) {
      return operation === 'save'
        ? 'Check the event settings and try again.'
        : 'This event request is invalid. Return to Events and open the event again.';
    }

    if (error.status === 429) {
      return 'Too many requests. Wait a moment before trying again.';
    }
  }

  return operation === 'save'
    ? 'We could not confirm whether your settings were saved. Reload the saved settings before submitting again.'
    : 'We could not load the event settings. Please try again.';
};
