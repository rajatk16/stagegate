import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/services/firebase.service';
import {
  UpdateUserProfileRequest,
  UserProfileFields,
} from '@stagegate/contracts';
import {
  ProfileDocument,
  profileDocumentConverter,
} from '../converter/profileDocument.converter';
import { Timestamp } from 'firebase-admin/firestore';

const emptyProfile: UserProfileFields = {
  displayName: null,
  bio: null,
  location: null,
  occupation: null,
  contactEmail: null,
  contactPhone: null,
  socialLinks: [],
};

@Injectable()
export class ProfilesRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection('userProfiles')
      .withConverter(profileDocumentConverter);
  }

  private ref(userId: string) {
    return this.collection().doc(userId);
  }

  async find(userId: string) {
    return (await this.ref(userId).get()).data();
  }

  async patch(
    userId: string,
    patch: UpdateUserProfileRequest,
  ): Promise<ProfileDocument> {
    const ref = this.ref(userId);
    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const current = (await transaction.get(ref)).data();
        const next: ProfileDocument = {
          ...(current ?? emptyProfile),
          ...patch,
          updatedAt: Timestamp.now(),
        };
        transaction.set(ref, next);
        return next;
      },
    );
  }

  async delete(userId: string): Promise<void> {
    await this.ref(userId).delete();
  }
}
