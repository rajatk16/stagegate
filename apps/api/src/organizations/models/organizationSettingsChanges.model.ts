import z from 'zod';

import { organizationSchema } from './organization.model';

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
