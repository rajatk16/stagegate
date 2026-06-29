import { z } from 'zod';

import {
  optionalUrl,
  optionalSlug,
  optionalString,
  requiredString,
} from '@/lib';

export const createOrganizationSchema = z.object({
  name: requiredString(3, 100),

  slug: optionalSlug(),

  description: optionalString(1000),

  websiteUrl: optionalUrl(),

  logoUrl: optionalUrl(),
});
