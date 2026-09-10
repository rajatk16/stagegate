import { z } from 'zod';

import { apiRequest } from '../../../lib';
import { membershipRoleSchema } from '../../organizations';

const memberSchema = z.object({
  membershipId: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  displayName: z.string().nullable(),
  role: membershipRoleSchema,
  status: z.enum(['ACTIVE', 'SUSPENDED', 'REMOVED']),
  version: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

const memberListSchema = z.array(memberSchema);

export type OrganizationMember = z.infer<typeof memberSchema>;

export const listOrganizationMembers = async (
  organizationId: string,
): Promise<readonly OrganizationMember[]> => {
  const response = await apiRequest(`/organizations/${encodeURIComponent(organizationId)}/members`);

  return memberListSchema.parse(response);
};
