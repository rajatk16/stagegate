import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { UserProfileDocument } from '../types';
import { DiagnosticError } from '../../observalibility';
import { UserProfile, userProfileSchema } from '../models';

const userProfileDocumentSchema = userProfileSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

export const userProfileConverter: FirestoreDataConverter<
  UserProfile,
  UserProfileDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): UserProfileDocument {
    if (options !== undefined) {
      throw new DiagnosticError('PROFILE_PARTIAL_WRITE_UNSUPPORTED');
    }

    const profile = userProfileSchema.parse(value);

    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      biography: profile.biography,
      affiliation: profile.affiliation,
      timezone: profile.timezone,
      createdAt: Timestamp.fromDate(profile.createdAt),
      updatedAt: Timestamp.fromDate(profile.updatedAt),
    };
  },

  fromFirestore(snapshot): UserProfile {
    const result = userProfileDocumentSchema.safeParse(snapshot.data());

    if (!result.success) {
      throw new DiagnosticError('PROFILE_DOCUMENT_INVALID');
    }

    const document = result.data;

    if (document.uid !== snapshot.id) {
      throw new DiagnosticError('PROFILE_IDENTITY_MISMATCH');
    }

    return {
      uid: document.uid,
      email: document.email,
      displayName: document.displayName,
      photoURL: document.photoURL,
      biography: document.biography,
      affiliation: document.affiliation,
      timezone: document.timezone,
      createdAt: document.createdAt.toDate(),
      updatedAt: document.updatedAt.toDate(),
    };
  },
};
