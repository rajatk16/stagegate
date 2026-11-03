import { Timestamp } from 'firebase-admin/firestore';

import { EventMembership } from '../models/eventMembership.model';

export type EventMembershipDocument = Omit<
  EventMembership,
  'createdAt' | 'updatedAt'
> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
