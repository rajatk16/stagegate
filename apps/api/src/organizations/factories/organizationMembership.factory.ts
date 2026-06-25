import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';

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
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  };
};
