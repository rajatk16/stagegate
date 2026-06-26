import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';

export const createMembershipFactory = (
  organizationId: string,
  userId: string,
  roles: OrganizationRole[],
  status: MembershipStatus,
): OrganizationMembership => {
  const now = Timestamp.now();

  return {
    id: randomUUID(),
    organizationId,
    userId,
    roles: roles,
    status: status,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  };
};
