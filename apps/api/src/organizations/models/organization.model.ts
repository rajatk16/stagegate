import z from 'zod';
import { length as hasValidLength, isURL } from 'class-validator';

import { ORGANIZATION_SLUG_PATTERN } from '../constants';

const uidSchema = z
  .string()
  .min(1)
  .max(128)
  .refine(
    (value) =>
      !value.includes('/') &&
      value !== '.' &&
      value !== '..' &&
      !/^__.*__$/.test(value),
  );

const slugSchema = z.string().min(3).max(63).regex(ORGANIZATION_SLUG_PATTERN);

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
    createdByUid: uidSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const organizationMembershipSchema = z
  .object({
    organizationId: z.string().uuid(),
    uid: uidSchema,
    role: z.literal('OWNER'),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export const organizationSlugSchema = z
  .object({
    slug: slugSchema,
    organizationId: z.string().uuid(),
    createdAt: z.date(),
  })
  .strict();

export type Organization = z.infer<typeof organizationSchema>;

export type OrganizationMembership = z.infer<
  typeof organizationMembershipSchema
>;

export type OrganizationSlug = z.infer<typeof organizationSlugSchema>;

export const organizationSettingsChangesSchema = organizationSchema
  .pick({
    name: true,
    description: true,
    websiteURL: true,
    primaryColor: true,
    secondaryColor: true,
  })
  .partial()
  .strict();

export type OrganizationSettingsChanges = z.infer<
  typeof organizationSettingsChangesSchema
>;
