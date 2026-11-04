import z from 'zod';
import { length } from 'class-validator';

import { SLUG_PATTERN } from '../../common/constants';
import { EVENT_FORMAT } from '../enums/eventFormat.enum';
import { EVENT_STATUS } from '../enums/eventStatus.enum';
import { instantSchema } from '../../common/models/instant.model';
import { organizationSchema } from '../../organizations/models/organization.model';

export const eventSlugValueSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(SLUG_PATTERN);

const nullableText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .refine((value) => Array.from(value).length <= maximumLength)
    .transform((value) => value || null)
    .nullable()
    .default(null);

const scheduleDateSchema = instantSchema.nullable().default(null);

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
    submissionOpensAt: scheduleDateSchema,
    submissionClosesAt: scheduleDateSchema,
    submissionInstructions: nullableText(10_000),
    maxSubmissionsPerPerson: z
      .number()
      .int()
      .min(1)
      .max(Number.MAX_SAFE_INTEGER)
      .nullable()
      .default(null),
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
  const pairs = [
    ['startsAt', 'endsAt'],
    ['submissionOpensAt', 'submissionClosesAt'],
  ] as const;

  for (const [startField, endField] of pairs) {
    const start = event[startField];
    const end = event[endField];

    if ((start === null) !== (end === null)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [start === null ? startField : endField],
        message: 'Provide both dates or leave both empty.',
      });

      continue;
    }

    if (start !== null && end !== null && end?.getTime() <= start.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [endField],
        message: 'The closing date must be after the opening date.',
      });
    }
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
    | 'submissionOpensAt'
    | 'submissionClosesAt'
    | 'submissionInstructions'
    | 'maxSubmissionsPerPerson'
  >
>;

export type EventSlugReservation = z.infer<typeof eventSlugReservationSchema>;
