import { Timestamp } from 'firebase-admin/firestore';

import { ReviewAssignmentStatus } from '../enums';

export class ReviewAssignment {
  id: string; // deterministic SHA-256
  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  proposalId: string;
  reviewerUserId: string;

  status: ReviewAssignmentStatus;
  dueAt: Timestamp | null;

  assignedBy: string;
  assignedAt: Timestamp;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  declinedAt: Timestamp | null;
  revokedAt: Timestamp | null;
  revokedBy: string | null;
  revokeReason: string | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
