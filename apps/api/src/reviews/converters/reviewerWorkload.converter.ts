import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { ReviewerWorkload } from '../entities';

export const reviewerWorkloadConverter: FirestoreDataConverter<ReviewerWorkload> =
  {
    toFirestore: (reviewerWorkload: ReviewerWorkload) => ({
      ...reviewerWorkload,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        eventId: data.eventId as string,
        cfpId: data.cfpId as string,
        reviewPeriodId: data.reviewPeriodId as string,
        reviewerUserId: data.reviewerUserId as string,

        assignedCount: data.assignedCount as number,
        inProgressCount: data.inProgressCount as number,
        completedCount: data.completedCount as number,
        declinedCount: data.declinedCount as number,
        revokedCount: data.revokedCount as number,

        activeAssignmentCount: data.activeAssignmentCount as number,
        overdueAssignmentCount: data.overdueAssignmentCount as number,

        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
