import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';
import { FirebaseService } from '@/firebase/firebase.service';

import { User } from '../entities';
import { UserStatus } from '../enums';
import { userConverter } from '../converters';
import { USERS_COLLECTION } from '../constants';

@Injectable()
export class UserRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(USERS_COLLECTION)
      .withConverter(userConverter);
  }

  async create(user: User): Promise<User> {
    await this.collection().doc(user.id).set(user);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const snapshot = await this.collection().doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as User;
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) {
      return [];
    }

    const snapshots = await Promise.all(
      userIds.map((id) => this.collection().doc(id).get()),
    );

    return snapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => snapshot.data()!);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const snapshot = await this.collection()
      .where('firebaseUid', '==', firebaseUid)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection()
      .where('email', '==', email.toLowerCase())
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }

  async update(id: string, updates: Partial<User>): Promise<void> {
    await this.collection()
      .doc(id)
      .update({
        ...updates,
        updatedAt: Timestamp.now(),
      });
  }

  async deactivate(id: string): Promise<void> {
    await this.update(id, {
      status: UserStatus.INACTIVE,
    });
  }
}
