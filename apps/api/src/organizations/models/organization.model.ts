import z from 'zod';
import { length as hasValidLength } from 'class-validator';

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

export const organizationSchema = z
  .object({
    id: z.string().uuid(),
    name: z
      .string()
      .trim()
      .refine((value) => hasValidLength(value, 2, 120)),
    slug: slugSchema,
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
