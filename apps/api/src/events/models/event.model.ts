import z from 'zod';
import { length } from 'class-validator';

import { EVENT_FORMAT, EVENT_STATUS } from '../enums';
import { EVENT_SLUG_PATTERN } from '../constants';
import { organizationSchema } from '../../organizations/models';

export const eventSlugValueSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(EVENT_SLUG_PATTERN);

const nullableText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .refine((value) => Array.from(value).length <= maximumLength)
    .transform((value) => value || null)
    .nullable()
    .default(null);

const scheduleDateSchema = z
  .date()
  .refine(
    (value) => value.getUTCFullYear() >= 1 && value.getUTCFullYear() <= 9_999,
    'Date is outside the supported storage range.',
  )
  .nullable()
  .default(null);

export const eventObjectSchema = z
  .object({
    id: z.string().uuid(),
    organizationId: organizationSchema.shape.id,
    name: z
      .string()
      .trim()
      .refine((value) => length(value, 2, 120)),
    slug: eventSlugValueSchema,
    status: z.nativeEnum(EVENT_STATUS),
    description: nullableText(5_000),
    format: z.nativeEnum(EVENT_FORMAT).nullable().default(null),
    location: nullableText(500),
    startsAt: scheduleDateSchema,
    endsAt: scheduleDateSchema,
    timezone: z
      .string()
      .trim()
      .refine((value) => {
        if (value !== 'UTC' && !value.includes('/')) return false;

        try {
          new Intl.DateTimeFormat('en', { timeZone: value });
          return true;
        } catch {
          return false;
        }
      }, 'Use a valid IANA timezone.')
      .default('UTC'),
    createdByUid: organizationSchema.shape.createdByUid,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const eventSchema = eventObjectSchema.superRefine((event, context) => {
  const hasStart = event.startsAt !== null;
  const hasEnd = event.endsAt !== null;

  if (hasStart !== hasEnd) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [hasStart ? 'endsAt' : 'startsAt'],
      message: 'Provide both dates or leave both empty.',
    });
    return;
  }

  if (
    event.startsAt !== null &&
    event.endsAt !== null &&
    event.endsAt.getTime() <= event.startsAt.getTime()
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endsAt'],
      message: 'The end must be after the start.',
    });
  }
});

export const eventSlugReservationSchema = z
  .object({
    organizationId: organizationSchema.shape.id,
    eventId: z.string().uuid(),
    slug: eventSlugValueSchema,
    createdAt: z.date(),
  })
  .strict();

export type Event = z.infer<typeof eventSchema>;

export type EventSettingsUpdate = Partial<
  Pick<
    Event,
    | 'name'
    | 'description'
    | 'format'
    | 'location'
    | 'startsAt'
    | 'endsAt'
    | 'timezone'
  >
>;

export type EventSlugReservation = z.infer<typeof eventSlugReservationSchema>;
