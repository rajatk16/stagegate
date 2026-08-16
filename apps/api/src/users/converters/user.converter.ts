import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { User } from '../entities';
import { UserStatus } from '../enums';

export const userConverter: FirestoreDataConverter<User> = {
  toFirestore: (user: User) => ({
    ...user,
  }),

  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      firebaseUid: data.firebaseUid as string,
      email: data.email as string,
      displayName: data.displayName as string,
      photoUrl: data.photoUrl as string,
      status: data.status as UserStatus,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      lastAuthenticatedAt: toDate(data.lastAuthenticatedAt),
      suspendedAt: toNullableDate(data.suspendedAt),
      suspendedReason: (data.suspendedReason as string) ?? null,
      deactivatedAt: toNullableDate(data.deactivatedAt),
      deletionRequestedAt: toNullableDate(data.deletionRequestedAt),
      deletionScheduledFor: toNullableDate(data.deletionScheduledFor),
      anonymizedAt: toNullableDate(data.anonymizedAt),
    };
  },
};
