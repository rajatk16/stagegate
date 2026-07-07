import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const organizationFormSchema = z.object({
  name: z.string().trim().min(3).max(100),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(50)
    .regex(
      slugRegex,
      'Slug may only contain lowercase letters, numbers, and hyphens.',
    ),
  description: z.string().max(100).optional(),
  websiteUrl: z.url().optional(),
  logoUrl: z.url().optional(),
});

export type OrganizationFormSchema = z.infer<typeof organizationFormSchema>;
