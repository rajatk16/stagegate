import { z } from 'zod';

import { OrganizationRole } from '../types';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const organizationSlug = z
  .string()
  .trim()
  .min(3)
  .max(50)
  .regex(
    slugRegex,
    'Slug may only contain lowercase letters, numbers, and hyphens.',
  );

const organizationName = z.string().trim().min(3).max(100);

const optionalUrl = z
  .url()
  .optional()
  .or(z.literal(''))
  .transform((value) => value || undefined);

export const createOrganizationSchema = z.object({
  logoUrl: optionalUrl,
  name: organizationName,
  websiteUrl: optionalUrl,
  slug: organizationSlug.optional(),
  description: z.string().trim().max(1000).optional(),
});

export const updateOrganizationSchema = createOrganizationSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    'Atleast one field must be updated.',
  );

export const inviteMemberSchema = z.object({
  email: z.email(),
  roles: z.array(z.enum(OrganizationRole)).min(1),
});

export const transferOwnershipSchema = z.object({
  userId: z.uuid(),
});

export const updateMemberRolesSchema = z.object({
  roles: z.array(z.enum(OrganizationRole)).min(1),
});
