import z from 'zod';

import { uidSchema } from '../../common/models/uid.model';
import { instantSchema } from '../../common/models/instant.model';
import { EVENT_CONFIGURATION_KIND } from '../enums/eventConfigurationKind.enum';

export const eventConfigurationObjectSchema = z
  .object({
    id: z.string().uuid(),
    organizationId: z.string().uuid(),
    eventId: z.string().uuid(),
    kind: z.nativeEnum(EVENT_CONFIGURATION_KIND),
    name: z
      .string()
      .trim()
      .min(1)
      .refine(
        (value) => Array.from(value).length <= 120,
        'Use 120 characters or fewer.',
      ),
    description: z
      .string()
      .trim()
      .refine((value) => Array.from(value).length <= 2_000)
      .transform((value) => value || null)
      .nullable()
      .default(null),
    durationMinutes: z
      .number()
      .int()
      .min(1)
      .max(1_440)
      .nullable()
      .default(null),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
    everReferenced: z.boolean(),
    createdByUid: uidSchema,
    createdAt: instantSchema,
    updatedAt: instantSchema,
  })
  .strict();

export const eventConfigurationSchema =
  eventConfigurationObjectSchema.superRefine((value, context) => {
    if (
      value.kind !== EVENT_CONFIGURATION_KIND.SESSION_TYPE &&
      value.durationMinutes !== null
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['durationMinutes'],
        message: 'Only session types can have a duration.',
      });
    }
  });

export const createEventConfigurationSchema =
  eventConfigurationObjectSchema.pick({
    kind: true,
    name: true,
    description: true,
    durationMinutes: true,
    isActive: true,
    sortOrder: true,
  });

export const updateEventConfigurationSchema = eventConfigurationObjectSchema
  .pick({
    name: true,
    description: true,
    durationMinutes: true,
    isActive: true,
    sortOrder: true,
  })
  .partial();

export const submissionConfigurationSelectionSchema = z
  .object({
    trackId: z.string().uuid().nullable(),
    sessionTypeId: z.string().uuid().nullable(),
    audienceLevelId: z.string().uuid().nullable(),
  })
  .strict();

export type EventConfiguration = z.infer<typeof eventConfigurationSchema>;

export type SubmissionConfigurationSelection = z.infer<
  typeof submissionConfigurationSelectionSchema
>;
