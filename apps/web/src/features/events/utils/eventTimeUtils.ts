import { Temporal } from '@js-temporal/polyfill';

export const isValidEventTimezone = (value: string) => {
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

  const local = Temporal.PlainDateTime.from(localValue, {
    overflow: 'reject',
  });

  if (local.microsecond !== 0 || local.nanosecond !== 0) {
    throw new RangeError('Use millisecond precision or less.');
  }

  const instant = local
    .toZonedDateTime(timezone, { disambiguation: 'reject' })
    .toInstant()
    .toString({ fractionalSecondDigits: 3 });

  if (!/^(?!0000)\d{4}-/.test(instant)) {
    throw new RangeError('Date is outside the supported range.');
  }

  return instant;
};

export const toEventLocalInput = (
  instant: string | null,
  timezone: string,
): string => {
  if (instant === null) return '';

  return Temporal.Instant.from(instant)
    .toZonedDateTimeISO(timezone)
    .toPlainDateTime()
    .toString({ smallestUnit: 'millisecond' });
};

export const toEventInstantForSave = (
  localValue: string,
  timezone: string,
  savedInstant: string | null,
  savedTimezone: string,
): string | null => {
  if (timezone === savedTimezone && savedInstant !== null && localValue) {
    const local = Temporal.PlainDateTime.from(localValue, {
      overflow: 'reject',
    });

    const savedLocal = Temporal.Instant.from(savedInstant)
      .toZonedDateTimeISO(savedTimezone)
      .toPlainDateTime();

    if (local.equals(savedLocal)) return savedInstant;
  }

  return toEventInstant(localValue, timezone);
};

export const isEventEndAfterStart = (
  startsAt: string,
  endsAt: string,
): boolean =>
  Temporal.Instant.compare(
    Temporal.Instant.from(endsAt),
    Temporal.Instant.from(startsAt),
  ) > 0;

export const formatEventInstant = (
  instant: string | null,
  timezone: string,
): string => {
  if (instant === null) return 'Not set';

  return new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'longOffset',
  }).format(new Date(instant));
};
