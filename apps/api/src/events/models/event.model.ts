import z from 'zod';
import { length as hasValidLength } from 'class-validator';

import { EVENT_SLUG_PATTERN } from '../constants';
import { organizationSchema } from '../../organizations/models';

export const eventSlugValueSchema = z
  .string()
  .min(3)
  .max(63)
  .regex(EVENT_SLUG_PATTERN);

export const eventSchema = z
  .object({
    id: z.string().uuid(),
    organizationId: organizationSchema.shape.id,
    name: z
      .string()
      .trim()
      .refine((value) => hasValidLength(value, 2, 120)),
    slug: eventSlugValueSchema,
    status: z.literal('DRAFT'),
    createdByUid: organizationSchema.shape.createdByUid,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const eventSlugReservationSchema = z
  .object({
    organizationId: organizationSchema.shape.id,
    eventId: z.string().uuid(),
    slug: eventSlugValueSchema,
    createdAt: z.date(),
  })
  .strict();

export type Event = z.infer<typeof eventSchema>;

export type EventSlugReservation = z.infer<typeof eventSlugReservationSchema>;
