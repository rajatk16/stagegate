import { Timestamp } from 'firebase-admin/firestore';

export class ReviewerWorkload {
  id: string;

  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  reviewerUserId: string;

  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  declinedCount: number;
  revokedCount: number;

  activeAssignmentCount: number;
  overdueAssignmentCount: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
