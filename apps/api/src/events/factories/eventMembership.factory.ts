import { Timestamp } from 'firebase-admin/firestore';

import { EventRole } from '@/auth';

import { EventMembership } from '../entities';
import { EventMembershipStatus } from '../enums';
import { createEventMembershipId } from '../utils';

export const createEventMembershipFactory = (
  eventId: string,
  userId: string,
  role: EventRole,
): EventMembership => {
  const now = Timestamp.now();

  return {
    createdAt: now,
    eventId: eventId,
    id: createEventMembershipId(eventId, userId),
    joinedAt: now,
    role: role,
    removedAt: null,
    removedBy: null,
    status: EventMembershipStatus.ACTIVE,
    updatedAt: now,
    userId,
  };
};
