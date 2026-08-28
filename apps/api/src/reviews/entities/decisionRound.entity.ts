import { Timestamp } from 'firebase-admin/firestore';

import { DecisionRoundStatus } from '../enums';

export class DecisionRound {
  id: string;
  eventId: string;
  reviewPeriodId: string;
  cfpId: string;

  name: string;
  status: DecisionRoundStatus;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;

  openedAt: Timestamp | null;
  lockedAt: Timestamp | null;
  lockedBy: string | null;
}
