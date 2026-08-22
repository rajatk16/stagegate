import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { ReviewPeriodStatus } from '../enums';
import { ReviewCriterion, ReviewPeriod } from '../entities';

export const reviewPeriodConverter: FirestoreDataConverter<ReviewPeriod> = {
  toFirestore: (reviewPeriod: ReviewPeriod) => ({
    ...reviewPeriod,
  }),
  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      eventId: data.eventId as string,
      cfpId: data.cfpId as string,
      name: data.name as string,
      status: data.status as ReviewPeriodStatus,
      opensAt: toNullableDate(data.opensAt),
      closesAt: toNullableDate(data.closesAt),
      rubricVersion: data.rubricVersion as number,
      rubricSnapshot: data.rubricSnapshot as ReviewCriterion[],
      createdBy: data.createdBy as string,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      openedAt: toNullableDate(data.openedAt),
      closedAt: toNullableDate(data.closedAt),
    };
  },
};
