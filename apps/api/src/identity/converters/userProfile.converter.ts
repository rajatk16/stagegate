import {
  FirestoreDataConverter,
  PartialWithFieldValue,
  Timestamp,
} from 'firebase-admin/firestore';

import { UserProfile } from '../types/userProfile.type';
import { identityConflict } from '../utils/authOperation.util';

export const userProfileConverter: FirestoreDataConverter<
  UserProfile,
  UserProfile
> = {
  toFirestore<T extends PartialWithFieldValue<UserProfile>>(profile: T): T {
    return profile;
  },
  fromFirestore(snapshot) {
    const email: unknown = snapshot.get('email');
    const status: unknown = snapshot.get('status');
    const firebaseUid: unknown = snapshot.get('firebaseUid');
    const createdAt: unknown = snapshot.get('createdAt');
    const activatedAt: unknown = snapshot.get('activatedAt');

    if (typeof email !== 'string' || !email) throw identityConflict();

    const timestamps = {
      ...(createdAt instanceof Timestamp ? { createdAt } : {}),
      ...(activatedAt instanceof Timestamp ? { activatedAt } : {}),
    };

    if (status === 'placeholder' && firebaseUid === undefined) {
      return {
        ...timestamps,
        status,
        email,
      };
    }
    if (status === 'active' && typeof firebaseUid === 'string' && firebaseUid) {
      return {
        ...timestamps,
        status,
        email,
        firebaseUid,
      };
    }
    throw identityConflict();
  },
};
