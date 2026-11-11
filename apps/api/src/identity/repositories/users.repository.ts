import { Injectable } from '@nestjs/common';
import { FieldValue, Transaction } from 'firebase-admin/firestore';

import { UserProfile } from '../types/userProfile.type';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { userProfileConverter } from '../converters/userProfile.converter';
import { VerifiedFirebaseIdentity } from '../types/verifiedFirebaseIdentity.type';

@Injectable()
export class UsersRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private collection() {
    return this.firebase.firestore
      .collection('users')
      .withConverter(userProfileConverter);
  }

  private ref(userId: string) {
    return this.collection().doc(userId);
  }

  async find(
    transaction: Transaction,
    userId: string,
  ): Promise<UserProfile | undefined> {
    return (await transaction.get(this.ref(userId))).data();
  }

  createActive(
    transaction: Transaction,
    userId: string,
    { uid, email }: VerifiedFirebaseIdentity,
  ): void {
    transaction.create(this.ref(userId), {
      status: 'active',
      firebaseUid: uid,
      email,
      createdAt: FieldValue.serverTimestamp(),
      activatedAt: FieldValue.serverTimestamp(),
    });
  }

  activatePlaceholder(
    transaction: Transaction,
    userId: string,
    uid: string,
  ): void {
    transaction.update(this.ref(userId), {
      status: 'active',
      firebaseUid: uid,
      activatedAt: FieldValue.serverTimestamp(),
    });
  }
}
