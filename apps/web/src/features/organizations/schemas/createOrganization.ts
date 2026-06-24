import { z } from 'zod';

export const createOrganizationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters long.')
    .max(100, 'Organization name must be less than 100 characters long.'),
});

export type CreateOrganizationFormValues = z.infer<
  typeof createOrganizationSchema
>;
