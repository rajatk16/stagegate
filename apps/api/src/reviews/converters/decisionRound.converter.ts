import {
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { DecisionRound } from '../entities';
import { DecisionRoundStatus } from '../enums';

export const decisionRoundConverter: FirestoreDataConverter<DecisionRound> = {
  toFirestore: (decisionRound: DecisionRound) => ({
    ...decisionRound,
  }),
  fromFirestore: (snapshot: QueryDocumentSnapshot<DocumentData>) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      eventId: data.eventId as string,
      cfpId: data.cfpId as string,
      reviewPeriodId: data.reviewPeriodId as string,
      name: data.name as string,
      status: data.status as DecisionRoundStatus,
      createdBy: data.createdBy as string,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      openedAt: toNullableDate(data.openedAt),
      lockedAt: toNullableDate(data.lockedAt),
      lockedBy: (data.lockedBy as string | null | undefined) ?? null,
    };
  },
};
