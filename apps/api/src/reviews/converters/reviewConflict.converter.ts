import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { ConflictStatus } from '../enums';
import { ReviewConflict } from '../entities';

export const reviewConflictConverter: FirestoreDataConverter<ReviewConflict> = {
  toFirestore: (reviewConflict: ReviewConflict) => ({
    ...reviewConflict,
  }),
  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      eventId: data.eventId as string,
      cfpId: data.cfpId as string,
      proposalId: data.proposalId as string,
      reviewerUserId: data.reviewerUserId as string,
      status: data.status as ConflictStatus,
      reason: data.reason as string | null,
      declaredAt: toDate(data.declaredAt),
      resolvedAt: toNullableDate(data.resolvedAt),
      resolvedBy: data.resolvedBy as string | null,
      resolutionNote: data.resolutionNote as string | null,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};
