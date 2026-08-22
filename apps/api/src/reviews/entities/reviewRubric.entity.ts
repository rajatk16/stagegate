import { Timestamp } from 'firebase-admin/firestore';

import { ReviewCriterion } from './reviewCriterion.entity';

export class ReviewRubric {
  id: string; // same as cfpId
  eventId: string;
  cfpId: string;
  version: number;
  criteria: ReviewCriterion[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
