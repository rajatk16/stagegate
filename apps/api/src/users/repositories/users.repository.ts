import { Injectable } from "@nestjs/common";

import { UserProfile } from "../models";
import { UserProfileChanges } from "../types";
import { userProfileConverter } from "../converters";
import { toUserProfileUpdateDocument } from "../mappers";
import { FirebaseService } from "../../firebase/services";

@Injectable()
export class UsersRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private collection() {
    return this.firebase.firestore
      .collection('users')
      .withConverter(userProfileConverter);
  }

  private document(uid: string) {
    return this.collection().doc(uid);
  }

  async getOrCreate(candidate: UserProfile): Promise<UserProfile> {
    const reference = this.document(candidate.uid);

    return this.firebase.firestore.runTransaction(
      async (transaction): Promise<UserProfile> => {
        const snapshot = await transaction.get(reference);
        const existing = snapshot.data();

        if (existing !== undefined) {
          return existing;
        }

        transaction.create(reference, candidate);

        return candidate;
      }
    )
  }

  async updateProfile(
    candidate: UserProfile,
    changes: UserProfileChanges
  ): Promise<UserProfile> {
    const reference = this.document(candidate.uid);

    return this.firebase.firestore.runTransaction(
      async (transaction): Promise<UserProfile> => {
        const snapshot = await transaction.get(reference);
        const existing = snapshot.data();
        const base = existing ?? candidate;
        const updatedAt = new Date();

        const documentPatch = toUserProfileUpdateDocument(
          changes,
          updatedAt
        );

        const updatedProfile: UserProfile = {
          ...base,
          updatedAt
        };

        if (documentPatch.displayName !== undefined) {
          updatedProfile.displayName = documentPatch.displayName;
        }

        if (documentPatch.photoURL !== undefined) {
          updatedProfile.photoURL = documentPatch.photoURL;
        }

        if (documentPatch.displayName !== undefined) {
          updatedProfile.displayName = documentPatch.displayName;
        }
      
        if (documentPatch.photoURL !== undefined) {
          updatedProfile.photoURL = documentPatch.photoURL;
        }
      
        if (documentPatch.biography !== undefined) {
          updatedProfile.biography = documentPatch.biography;
        }
      
        if (documentPatch.affiliation !== undefined) {
          updatedProfile.affiliation = documentPatch.affiliation;
        }
      
        if (documentPatch.timezone !== undefined) {
          updatedProfile.timezone = documentPatch.timezone;
        }

        if (existing === undefined) {
          transaction.create(reference, updatedProfile);
        } else {
          transaction.update(reference, documentPatch);
        }

        return updatedProfile;
      } 
    );
  }
}
