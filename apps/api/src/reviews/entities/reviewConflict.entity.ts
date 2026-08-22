import { Timestamp } from 'firebase-admin/firestore';

import { ConflictStatus } from '../enums';

export class ReviewConflict {
  id: string; // proposalId_reviewerUserId
  eventId: string;
  cfpId: string;
  proposalId: string;
  reviewerUserId: string;

  status: ConflictStatus;
  reason: string | null;

  declaredAt: Timestamp;
  resolvedAt: Timestamp | null;
  resolvedBy: string | null;
  resolutionNote: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
