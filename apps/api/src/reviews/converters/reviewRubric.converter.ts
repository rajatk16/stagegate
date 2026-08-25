import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { ReviewCriterion, ReviewRubric } from '../entities';

export const reviewRubricConverter: FirestoreDataConverter<ReviewRubric> = {
  toFirestore: (reviewRubric: ReviewRubric) => ({
    ...reviewRubric,
  }),
  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      eventId: data.eventId as string,
      cfpId: data.cfpId as string,
      version: data.version as number,
      criteria: data.criteria as ReviewCriterion[],
      createdBy: data.createdBy as string,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};
