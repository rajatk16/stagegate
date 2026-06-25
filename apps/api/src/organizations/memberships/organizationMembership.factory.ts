import { Timestamp } from 'firebase-admin/firestore';
import { OrganizationMembership } from './entities';
import { randomUUID } from 'crypto';
import { OrganizationRole } from '@/authorization/enums';
import { MembershipStatus } from './enums';

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
    status: MembershipStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };
};
