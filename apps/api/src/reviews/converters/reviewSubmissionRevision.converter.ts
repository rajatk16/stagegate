import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { ReviewRecommendation } from '../enums';
import { ReviewSubmissionRevision } from '../entities';

export const reviewSubmissionRevisionConverter: FirestoreDataConverter<ReviewSubmissionRevision> =
  {
    toFirestore: (revision: ReviewSubmissionRevision) => ({
      ...revision,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        reviewId: data.reviewId as string,
        eventId: data.eventId as string,
        cfpId: data.cfpId as string,
        reviewPeriodId: data.reviewPeriodId as string,
        assignmentId: data.assignmentId as string,
        proposalId: data.proposalId as string,

        reviewerUserId: data.reviewerUserId as string,
        revisionNumber: data.revisionNumber as number,

        rubricVersion: data.rubricVersion as number,
        rubricSnapshot:
          data.rubricSnapshot as ReviewSubmissionRevision['rubricSnapshot'],
        criterionScores:
          data.criterionScores as ReviewSubmissionRevision['criterionScores'],
        writtenFeedback: data.writtenFeedback as string | null,
        recommendation: data.recommendation as ReviewRecommendation,

        submittedAt: toDate(data.submittedAt),
        createdAt: toDate(data.createdAt),
      };
    },
  };
