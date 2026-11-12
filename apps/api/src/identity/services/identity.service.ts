import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DocumentSnapshot } from 'firebase-admin/firestore';

import {
  IdentityResponse,
  IDENTITY_ERROR_CODES,
  AccountDetailsResponse,
} from '@stagegate/contracts';

import { UserProfile } from '../types/userProfile.type';
import { IdentityError } from '../errors/identity.error';
import { UsersRepository } from '../repositories/users.repository';
import { normalizeIdentityEmail } from '../utils/identityEmail.util';
import { FirebaseService } from '../../firebase/services/firebase.service';
import { authOperation, identityConflict } from '../utils/authOperation.util';
import { VerifiedFirebaseIdentity } from '../types/verifiedFirebaseIdentity.type';
import { IdentityMappingsRepository } from '../repositories/identityMappings.repository';

const authTimestamp = (value: string | null | undefined): string | null => {
  const time = value ? Date.parse(value) : NaN;
  return Number.isFinite(time) ? new Date(time).toISOString() : null;
};

@Injectable()
export class IdentityService {
  constructor(
    private readonly users: UsersRepository,
    private readonly firebase: FirebaseService,
    private readonly mappings: IdentityMappingsRepository,
  ) {}

  async activate(
    identity: VerifiedFirebaseIdentity,
  ): Promise<IdentityResponse> {
    const { uid, email } = identity;
    await this.getVerifiedAccount(identity);
    const newUserId = randomUUID();

    return this.firebase.firestore.runTransaction(async (transaction) => {
      const { uidUserId, emailUserId } = await this.mappings.findBindings(
        transaction,
        uid,
        email,
      );
      if (uidUserId && uidUserId !== emailUserId) throw identityConflict();

      const userId = emailUserId ?? newUserId;
      if (emailUserId) {
        const profile = await this.users.find(transaction, userId);
        if (uidUserId) return this.activeIdentity(profile, userId, identity);

        if (profile?.status !== 'placeholder' || profile.email !== email) {
          throw identityConflict();
        }
        this.users.activatePlaceholder(transaction, userId, uid);
      } else {
        this.users.createActive(transaction, userId, identity);
        this.mappings.createEmailMapping(transaction, email, userId);
      }

      this.mappings.createUidMapping(transaction, uid, userId);

      return { userId, email };
    });
  }

  async getActive(
    identity: VerifiedFirebaseIdentity,
  ): Promise<IdentityResponse> {
    return this.firebase.firestore.runTransaction(
      async (transaction) => {
        const userId = await this.mappings.findByUid(transaction, identity.uid);
        if (!userId) {
          throw new IdentityError(
            HttpStatus.FORBIDDEN,
            IDENTITY_ERROR_CODES.ACCOUNT_ACTIVATION_REQUIRED,
            'Activate your StageGate account to continue.',
          );
        }

        const [profile, emailUserId] = await Promise.all([
          this.users.find(transaction, userId),
          this.mappings.findByEmail(transaction, identity.email),
        ]);
        if (emailUserId !== userId) throw identityConflict();
        return this.activeIdentity(profile, userId, identity);
      },
      {
        readOnly: true,
      },
    );
  }

  private mappedUserId(snapshot: DocumentSnapshot): string | undefined {
    if (!snapshot.exists) return undefined;

    const id: unknown = snapshot.get('userId');
    if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id))
      throw identityConflict();

    return id;
  }

  private activeIdentity(
    profile: UserProfile | undefined,
    userId: string,
    { uid, email }: VerifiedFirebaseIdentity,
  ): IdentityResponse {
    if (
      profile?.status !== 'active' ||
      profile.firebaseUid !== uid ||
      profile.email !== email
    ) {
      throw identityConflict();
    }
    return { userId, email };
  }

  async getAccountDetails(
    identity: VerifiedFirebaseIdentity,
  ): Promise<AccountDetailsResponse> {
    const { userId, email } = await this.getActive(identity);
    const account = await this.getVerifiedAccount(identity);

    return {
      userId,
      email,
      emailVerified: true,
      createdAt: authTimestamp(account.metadata.creationTime),
      lastSignInAt: authTimestamp(account.metadata.lastSignInTime),
    };
  }

  private async getVerifiedAccount({ uid, email }: VerifiedFirebaseIdentity) {
    const auth = this.firebase.auth;
    const account = await authOperation(() => auth.getUser(uid));

    if (account.disabled) {
      throw new IdentityError(
        HttpStatus.UNAUTHORIZED,
        IDENTITY_ERROR_CODES.INVALID_ID_TOKEN,
        'Sign in again to continue.',
      );
    }

    if (!account.emailVerified) {
      throw new IdentityError(
        HttpStatus.FORBIDDEN,
        IDENTITY_ERROR_CODES.EMAIL_NOT_VERIFIED,
        'Verify your email to continue.',
      );
    }

    if (normalizeIdentityEmail(account.email ?? '') !== email) {
      throw identityConflict();
    }

    return account;
  }
}
