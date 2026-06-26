import { FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

import { User } from '../entities';
import { UserStatus } from '../enums';

const toDate = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  throw new Error('Expected Firestore Timestamp');
};

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
    };
  },
};
