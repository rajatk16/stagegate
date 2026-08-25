import { Timestamp } from 'firebase-admin/firestore';

import { ReviewRecommendation, ReviewStatus } from '../enums';
import { ReviewCriterionScore } from './reviewCriterionScore.entity';

export class Review {
  id: string; // deterministic: assignmentId
  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  assignmentId: string;
  proposalId: string;

  reviewerUserId: string; // internal only; never return to reviewer UI
  status: ReviewStatus;

  criterionScores: ReviewCriterionScore[];
  writtenFeedback: string | null;
  recommendation: ReviewRecommendation | null;

  currentRevisionNumber: number;
  submittedAt: Timestamp | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
