import { Timestamp } from 'firebase-admin/firestore';

import { ReviewPeriodStatus } from '../enums';
import { ReviewCriterion } from './reviewCriterion.entity';

export class ReviewPeriod {
  id: string;
  eventId: string;
  cfpId: string;

  name: string;
  status: ReviewPeriodStatus;
  opensAt: Timestamp | null;
  closesAt: Timestamp | null;

  rubricVersion: number;
  rubricSnapshot: ReviewCriterion[];

  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  openedAt: Timestamp | null;
  closedAt: Timestamp | null;
}
