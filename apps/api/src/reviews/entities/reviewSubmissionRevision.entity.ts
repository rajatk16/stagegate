import { Timestamp } from 'firebase-admin/firestore';

import { ReviewRecommendation } from '../enums';
import { ReviewCriterion } from './reviewCriterion.entity';
import { ReviewCriterionScore } from './reviewCriterionScore.entity';

export class ReviewSubmissionRevision {
  id: string; // `${assignmentId}_${revisionNumber}`
  reviewId: string;
  eventId: string;
  cfpId: string;
  reviewPeriodId: string;
  assignmentId: string;
  proposalId: string;

  reviewerUserId: string; // internal only
  revisionNumber: number;

  rubricVersion: number;
  rubricSnapshot: ReviewCriterion[];
  criterionScores: ReviewCriterionScore[];
  writtenFeedback: string | null;
  recommendation: ReviewRecommendation;

  submittedAt: Timestamp;
  createdAt: Timestamp;
}
