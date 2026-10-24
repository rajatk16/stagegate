import { Temporal } from '@js-temporal/polyfill';

import { ApiError } from '@/lib';
import { isRecord } from '@/app/utils';

import { EventFormat, EventSettings } from '../types';
import { parseEvent } from './eventUtils';

export const isValidEventTimezone = (value: string): boolean => {
  if (value !== 'UTC' && !value.includes('/')) return false;

  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

export const toEventInstant = (
  localValue: string,
  timezone: string,
): string | null => {
  if (!localValue) return null;

  return Temporal.PlainDateTime.from(localValue, {
    overflow: 'reject',
  })
    .toZonedDateTime(timezone, { disambiguation: 'reject' })
    .toInstant()
    .toString({ fractionalSecondDigits: 3 });
};

export const toEventLocalInput = (
  instant: string | null,
  timezone: string,
): string => {
  if (instant === null) return '';

  return Temporal.Instant.from(instant)
    .toZonedDateTimeISO(timezone)
    .toPlainDateTime()
    .toString({ smallestUnit: 'second' });
};

export const isEventEndAfterStart = (
  startsAt: string,
  endsAt: string,
): boolean =>
  Temporal.Instant.compare(
    Temporal.Instant.from(endsAt),
    Temporal.Instant.from(startsAt),
  ) > 0;

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
    typeof value.timezone !== 'string' ||
    !isValidEventTimezone(value.timezone)
  ) {
    throw invalidSettingsResponse();
  }

  const startsAt = value.startsAt;
  const endsAt = value.endsAt;

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
