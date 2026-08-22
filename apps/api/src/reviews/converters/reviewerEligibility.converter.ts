import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { ReviewerEligibility } from '../entities';
import { ReviewerEligibilityStatus } from '../enums';

export const reviewerEligibilityConverter: FirestoreDataConverter<ReviewerEligibility> =
  {
    toFirestore: (reviewerEligibility: ReviewerEligibility) => ({
      ...reviewerEligibility,
    }),
    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        eventId: data.eventId as string,
        userId: data.userId as string,
        status: data.status as ReviewerEligibilityStatus,
        reason: data.reason as string | null,
        updatedBy: data.updatedBy as string,
        createdAt: toDate(data.createdAt),
        updatedAt: toDate(data.updatedAt),
      };
    },
  };
