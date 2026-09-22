import z from "zod";
import { FirestoreDataConverter, Timestamp, SetOptions } from "firebase-admin/firestore";

import { UserProfileDocument } from "../types";
import { UserProfile, userProfileSchema } from "../models";

const userProfileDocumentSchema = userProfileSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp)
});

export const userProfileConverter: FirestoreDataConverter<UserProfile, UserProfileDocument> = {
  toFirestore(
    value: unknown,
    options?: SetOptions
  ): UserProfileDocument {
    if (options !== undefined) {
      throw new Error('Partial profile writes are not supported');
    }

    const profile = userProfileSchema.parse(value);

    return {
      uid: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      createdAt: Timestamp.fromDate(profile.createdAt),
      updatedAt: Timestamp.fromDate(profile.updatedAt),
    };
  },

  fromFirestore(snapshot): UserProfile {
    const result = userProfileDocumentSchema.safeParse(snapshot.data());

    if (!result.success) {
      throw new Error(
        `Invalid user profile document: ${snapshot.ref.path}`
      );
    }

    const document = result.data;

    if (document.uid !== snapshot.id) {
      throw new Error(
        `User profile UID does not match document ID: ${snapshot.ref.path}`
      );
    }

    return {
      uid: document.uid,
      email: document.email,
      displayName: document.displayName,
      photoURL: document.photoURL,
      createdAt: document.createdAt.toDate(),
      updatedAt: document.updatedAt.toDate(),
    };
  }
};
