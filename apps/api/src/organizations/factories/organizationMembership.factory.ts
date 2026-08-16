import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/auth';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';
import { createOrganizationMembershipId } from '../utils';

export const createMembershipFactory = (
  organizationId: string,
  userId: string,
  roles: OrganizationRole[],
  status: MembershipStatus,
): OrganizationMembership => {
  const now = Timestamp.now();

  return {
    id: createOrganizationMembershipId(organizationId, userId),
    organizationId,
    userId,
    roles: [...new Set(roles)],
    status: status,
    joinedAt: now,
    removedAt: null,
    removedBy: null,
    createdAt: now,
    updatedAt: now,
  };
};
