import z from 'zod';
import { slugSchema } from '../../common/models/slug.model';

export const organizationSlugSchema = z
  .object({
    slug: slugSchema,
    organizationId: z.string().uuid(),
    createdAt: z.date(),
  })
  .strict();

export type OrganizationSlug = z.infer<typeof organizationSlugSchema>;
