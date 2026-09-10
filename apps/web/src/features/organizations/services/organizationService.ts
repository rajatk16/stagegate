import { z } from 'zod';

import { apiRequest } from '../../../lib';

const organizationSchema = z.object({
  organizationId: z.string(),
  name: z.string(),
  version: z.number().int().positive(),
  membership: z.object({
    membershipId: z.string(),
    role: z.literal('OWNER'),
    status: z.literal('ACTIVE'),
  }),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

const organizationListSchema = z.array(organizationSchema);

export type Organization = z.infer<typeof organizationSchema>;

export const bootstrapCurrentUser = async (): Promise<void> => {
  await apiRequest('/users/me/bootstrap', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const listOrganizations = async (): Promise<readonly Organization[]> => {
  const response = await apiRequest('/organizations');
  return organizationListSchema.parse(response);
};

export const createOrganization = async (name: string): Promise<Organization> => {
  const response = await apiRequest('/organizations', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  return organizationSchema.parse(response);
};
