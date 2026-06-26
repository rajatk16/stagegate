import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { OrganizationMembershipInvitation } from '../entities';
import { OrganizationMembershipInvitationStatus } from '../enums';

export const createMembershipInvitationFactory = (
  organizationId: string,
  email: string,
  invitedBy: string,
  roles: OrganizationRole[],
  userId?: string | null,
): OrganizationMembershipInvitation => {
  const now = Timestamp.now();

  const expiresAt = addDays(now, 14);

  return {
    id: randomUUID(),
    organizationId,
    email: email.trim().toLowerCase(),
    invitedBy,
    roles,
    status: OrganizationMembershipInvitationStatus.PENDING,
    userId: userId ?? null,
    expiresAt,
    acceptedAt: null,
    acceptedBy: null,
    createdAt: now,
    updatedAt: now,
  };
};

const addDays = (date: Timestamp, days: number): Timestamp => {
  return Timestamp.fromDate(
    new Date(date.toDate().getTime() + days * 24 * 60 * 60 * 1000),
  );
};
