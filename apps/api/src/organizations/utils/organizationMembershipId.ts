import { createHash } from 'crypto';

export const createOrganizationMembershipId = (
  organizationId: string,
  userId: string,
) => createHash('sha256').update(`${organizationId}-${userId}`).digest('hex');
