import { z } from 'zod';

import { optionalUrl, requiredString } from './common';

export const organizationSchema = z.object({
  name: requiredString(3, 100),

  slug: z
    .string()
    .trim()
    .min(3)
    .max(64)
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens.',
    )
    .optional()
    .or(z.literal('')),

  description: z.string().max(1000).optional(),

  websiteUrl: optionalUrl(),

  logoUrl: optionalUrl(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
