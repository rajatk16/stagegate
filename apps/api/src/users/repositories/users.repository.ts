import { Injectable } from '@nestjs/common';

import { UserProfile } from '../models/userProfile.model';
import { UserProfileChanges } from '../types/userProfileChanges.type';
import { PROFILE_FIELDS } from '../../audit/enums/profileFields.enum';
import { AuditWriter } from '../../audit/services/auditWriter.service';
import { userProfileConverter } from '../converters/userProfile.converter';
import { toUserProfileUpdateDocument } from '../mappers/userProfileUpdate.mapper';
import { FirebaseService } from '../../firebase/services/firebase.service';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly audit: AuditWriter,
    private readonly firebase: FirebaseService,
  ) {}

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
      },
    );
  }

  async updateProfile(
    candidate: UserProfile,
    changes: UserProfileChanges,
  ): Promise<UserProfile> {
    const reference = this.document(candidate.uid);

    const fields = Object.keys(changes).filter(
      (key) => changes[key as keyof UserProfileChanges] !== undefined,
    ) as readonly PROFILE_FIELDS[];

    const auditEvent = this.audit.prepareProfileUpdated(candidate.uid, fields);

    return this.firebase.firestore.runTransaction(
      async (transaction): Promise<UserProfile> => {
        const snapshot = await transaction.get(reference);
        const existing = snapshot.data();
        const base = existing ?? candidate;
        const updatedAt = new Date();

        const documentPatch = toUserProfileUpdateDocument(changes, updatedAt);

        const updatedProfile: UserProfile = {
          ...base,
          updatedAt,
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

        this.audit.append(transaction, auditEvent);

        return updatedProfile;
      },
    );
  }

  async findByUids(uids: readonly string[]): Promise<UserProfile[]> {
    const uniqueUids = [...new Set(uids)];

    if (uniqueUids.length === 0) {
      return [];
    }

    const references = uniqueUids.map((uid) => this.document(uid));
    const snapshots = await this.firebase.firestore.getAll(...references);

    const profiles: UserProfile[] = [];

    for (const snapshot of snapshots) {
      const profile = snapshot.data();

      if (profile !== undefined) {
        profiles.push(profile as UserProfile);
      }
    }

    return profiles;
  }
}
