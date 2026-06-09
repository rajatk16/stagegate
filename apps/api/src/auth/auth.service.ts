import { Injectable } from '@nestjs/common';
import { DocumentData, Timestamp } from 'firebase-admin/firestore';

import { User, UserStatus } from '@/common/interfaces';
import { FirebaseService } from '@/firebase/firebase.service';

import { FirebaseUser, SyncResponseDto } from './interfaces';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async syncUser(firebaseUser: FirebaseUser): Promise<SyncResponseDto> {
    const userRef = this.firebaseService.firestore
      .collection('users')
      .doc(firebaseUser.uid);

    const snapshot = await userRef.get();

    let user: User;

    if (!snapshot.exists) {
      user = await this.createUser(firebaseUser, userRef);
    } else {
      user = await this.updateExistingUser(
        firebaseUser,
        userRef,
        snapshot.data()!,
      );
    }

    return {
      user,
      // TODO: Implement organizations and active organization id lookup
      organizations: [],
      activeOrganizationId: null,
    };
  }

  private async createUser(
    firebaseUser: FirebaseUser,
    userRef: FirebaseFirestore.DocumentReference,
  ): Promise<User> {
    const now = Timestamp.now();

    const user: User = {
      createdAt: now,
      updatedAt: now,
      id: firebaseUser.uid,
      email: firebaseUser.email,
      status: UserStatus.ACTIVE,
      displayName: firebaseUser.name ?? null,
      photoUrl: firebaseUser.picture ?? null,
      emailVerified: firebaseUser.emailVerified ?? false,
    };

    await userRef.set(user);

    return user;
  }

  private async updateExistingUser(
    firebaseUser: FirebaseUser,
    userRef: FirebaseFirestore.DocumentReference,
    existingUserData: DocumentData,
  ) {
    const updates: Partial<User> = {};

    if (firebaseUser.name !== existingUserData.displayName) {
      updates.displayName = firebaseUser.name ?? null;
    }

    if (firebaseUser.picture !== existingUserData.photoUrl) {
      updates.photoUrl = firebaseUser.picture ?? null;
    }

    if (firebaseUser.emailVerified !== existingUserData.emailVerified) {
      updates.emailVerified = firebaseUser.emailVerified ?? false;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = Timestamp.now();
      await userRef.update(updates);
      const refreshed = await userRef.get();
      return {
        createdAt: refreshed.data()!.createdAt as Timestamp,
        updatedAt: refreshed.data()!.updatedAt as Timestamp,
        id: refreshed.data()!.id! as string,
        email: refreshed.data()!.email as string,
        status: refreshed.data()!.status as UserStatus,
        displayName: refreshed.data()!.displayName as string,
        photoUrl: refreshed.data()!.photoUrl as string,
        emailVerified: refreshed.data()!.emailVerified as boolean,
      };
    } else {
      return {
        createdAt: existingUserData.createdAt as Timestamp,
        updatedAt: existingUserData.updatedAt as Timestamp,
        id: existingUserData.id as string,
        email: existingUserData.email as string,
        status: existingUserData.status as UserStatus,
        displayName: existingUserData.displayName as string,
        photoUrl: existingUserData.photoUrl as string,
        emailVerified: existingUserData.emailVerified as boolean,
      };
    }
  }
}
