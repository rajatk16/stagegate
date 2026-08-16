import { Timestamp } from 'firebase-admin/firestore';

import { EventRole } from '@/auth';

import { EventMembershipStatus } from '../enums';

export class EventMembership {
  id: string;

  eventId: string;
  userId: string;

  role: EventRole;
  status: EventMembershipStatus;
  joinedAt: Timestamp;
  removedAt?: Timestamp | null;
  removedBy?: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
