import { Timestamp } from 'firebase-admin/firestore';
import { OrganizationMembership } from './entities';
import { randomUUID } from 'crypto';
import { OrganizationRole } from '@/authorization/enums';

export const createMembershipFactory = (
  organizationId: string,
  userId: string,
): OrganizationMembership => {
  const now = Timestamp.now();

  return {
    id: randomUUID(),
    organizationId,
    userId,
    roles: [OrganizationRole.OWNER],
    createdAt: now,
    updatedAt: now,
  };
};
