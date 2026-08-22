import { Timestamp } from 'firebase-admin/firestore';

import { ReviewerEligibilityStatus } from '../enums';

export class ReviewerEligibility {
  id: string; // eventId_userId
  eventId: string;
  userId: string;
  status: ReviewerEligibilityStatus;
  reason: string | null;
  updatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
