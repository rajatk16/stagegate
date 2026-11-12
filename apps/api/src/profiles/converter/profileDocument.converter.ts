import {
  Timestamp,
  PartialWithFieldValue,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import {
  UserProfileFields,
  userProfileFieldsSchema,
} from '@stagegate/contracts';

export type ProfileDocument = UserProfileFields & {
  updatedAt: Timestamp;
};

export const profileDocumentConverter: FirestoreDataConverter<
  ProfileDocument,
  ProfileDocument
> = {
  toFirestore<T extends PartialWithFieldValue<ProfileDocument>>(profile: T): T {
    return profile;
  },
  fromFirestore(snapshot) {
    const { updatedAt, ...fields } = snapshot.data();
    if (!(updatedAt instanceof Timestamp))
      throw new Error('Invalid stored profile timestamp.');
    return { ...userProfileFieldsSchema.parse(fields), updatedAt };
  },
};
