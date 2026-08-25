import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { Review } from '../entities';
import { ReviewRecommendation, ReviewStatus } from '../enums';

export const reviewConverter: FirestoreDataConverter<Review> = {
  toFirestore: (review: Review) => ({
    ...review,
  }),
  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      assignmentId: data.assignmentId as string,
      cfpId: data.cfpId as string,
      createdAt: toDate(data.createdAt),
      criterionScores: data.criterionScores as Review['criterionScores'],
      currentRevisionNumber: data.currentRevisionNumber as number,
      eventId: data.eventId as string,
      id: snapshot.id,
      proposalId: data.proposalId as string,
      recommendation: data.recommendation as ReviewRecommendation | null,
      reviewerUserId: data.reviewerUserId as string,
      reviewPeriodId: data.reviewPeriodId as string,
      status: data.status as ReviewStatus,
      submittedAt: toNullableDate(data.submittedAt),
      updatedAt: toDate(data.updatedAt),
      writtenFeedback: data.writtenFeedback as string | null,
    };
  },
};
