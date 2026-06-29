import type z from 'zod';

import type { createOrganizationSchema } from '../schemas';

export type OrganizationFormValues = z.infer<typeof createOrganizationSchema>;
