import z from 'zod';
import { length as hasValidLength, isURL } from 'class-validator';

import { uidSchema } from '../../common/models/uid.model';
import { slugSchema } from '../../common/models/slug.model';

const nullableColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .transform((value) => value.toUpperCase())
  .nullable()
  .default(null);

export const organizationSchema = z
  .object({
    id: z.string().uuid(),
    name: z
      .string()
      .trim()
      .refine((value) => hasValidLength(value, 2, 120)),
    slug: slugSchema,
    description: z
      .string()
      .trim()
      .refine((value) => hasValidLength(value, 0, 1_000))
      .nullable()
      .default(null),
    websiteURL: z
      .string()
      .trim()
      .refine(
        (value) =>
          hasValidLength(value, 1, 2_048) &&
          isURL(value, {
            protocols: ['https'],
            require_protocol: true,
            require_valid_protocol: true,
            disallow_auth: true,
          }),
      )
      .nullable()
      .default(null),
    primaryColor: nullableColorSchema,
    secondaryColor: nullableColorSchema,
    logoVersion: z.string().uuid().nullable().default(null),
    logoStoragePath: z.string().min(1).nullable().default(null),
    membershipRevision: z.number().int().nonnegative().default(0),
    createdByUid: uidSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export type Organization = z.infer<typeof organizationSchema>;
