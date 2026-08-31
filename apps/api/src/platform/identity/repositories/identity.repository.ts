import { z } from 'zod';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  Firestore,
  Timestamp,
  FieldValue,
  DocumentSnapshot,
  DocumentReference,
} from 'firebase-admin/firestore';

import { FIRESTORE } from '@stagegate/backend-platform';

import { IdentityError } from '../utils';
import { BootstrapResult, ProfilePatch, UserProfile } from '../types';

export abstract class UserProfileRepository {
  abstract find(userId: string): Promise<UserProfile | null>;

  abstract bootstrap(userId: string, requestId: string): Promise<BootstrapResult>;

  abstract update(userId: string, patch: ProfilePatch, requestId: string): Promise<UserProfile>;
}

const storedProfileSchema = z
  .object({
    userId: z.string().min(1).max(128),
    displayName: z.string().min(1).max(120).nullable(),
    bio: z.string().min(1).max(2_000).nullable(),
    version: z.number().int().positive(),
    schemaVersion: z.literal(1),
    createdAt: z.instanceof(Timestamp),
    updatedAt: z.instanceof(Timestamp),
    createdBy: z.string().min(1),
    updatedBy: z.string().min(1),
  })
  .strict();

@Injectable()
export class IdentityRepository extends UserProfileRepository {
  private readonly logger = new Logger(IdentityRepository.name);

  constructor(
    @Inject(FIRESTORE)
    private readonly firestore: Firestore,
  ) {
    super();
  }

  override find(userId: string): Promise<UserProfile | null> {
    return this.withStoreageErrors(async () => {
      const snapshot = await this.profileRef(userId).get();
      return snapshot.exists ? this.decode(snapshot) : null;
    });
  }

  override async bootstrap(userId: string, requestId: string): Promise<BootstrapResult> {
    return this.withStoreageErrors(async () => {
      const reference = this.profileRef(userId);
      const auditReference = this.firestore.collection('auditLogs').doc();

      const created = await this.firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);

        if (snapshot.exists) {
          this.decode(snapshot);
          return false;
        }

        transaction.create(reference, {
          userId,
          displayName: null,
          bio: null,
          version: 1,
          schemaVersion: 1,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdBy: userId,
          updatedBy: userId,
        });

        transaction.create(
          auditReference,
          this.auditData(userId, requestId, 'user.bootstrapped', 1, []),
        );

        return true;
      });

      return {
        created,
        profile: await this.readRequired(reference),
      };
    });
  }

  override update(userId: string, patch: ProfilePatch, requestId: string): Promise<UserProfile> {
    return this.withStoreageErrors(async () => {
      const reference = this.profileRef(userId);
      const auditReference = this.firestore.collection('auditLogs').doc();

      await this.firestore.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(reference);

        if (!snapshot.exists) {
          throw new IdentityError('USER_NOT_BOOTSTRAPPED');
        }

        const current = this.decode(snapshot);

        if (current.version !== patch.expectedVersion) {
          throw new IdentityError('CONCURRENCY_CONFLICT');
        }

        const changedFields = (['displayName', 'bio'] as const).filter(
          (field) => patch[field] !== undefined && patch[field] !== current[field],
        );

        if (changedFields.length === 0) {
          return;
        }

        const nextVersion = current.version + 1;

        const updates: Record<string, unknown> = {
          version: nextVersion,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: userId,
        };

        for (const field of changedFields) {
          updates[field] = patch[field];
        }

        transaction.update(reference, updates);

        transaction.create(
          auditReference,
          this.auditData(userId, requestId, 'user.profile.updated', nextVersion, changedFields),
        );
      });

      return this.readRequired(reference);
    });
  }

  private profileRef(userId: string): DocumentReference {
    if (
      userId.length === 0 ||
      userId.length > 128 ||
      userId.includes('/') ||
      userId === '.' ||
      userId === '..' ||
      /^__.*__$/.test(userId)
    ) {
      throw new IdentityError('PROFILE_DATA_INVALID');
    }

    return this.firestore.collection('users').doc(userId);
  }

  private decode(snapshot: DocumentSnapshot): UserProfile {
    const result = storedProfileSchema.safeParse(snapshot.data());

    if (!result.success || result.data.userId !== snapshot.id) {
      throw new IdentityError('PROFILE_DATA_INVALID');
    }

    const value = result.data;

    return {
      userId: value.userId,
      displayName: value.displayName,
      bio: value.bio,
      version: value.version,
      createdAt: value.createdAt.toDate(),
      updatedAt: value.updatedAt.toDate(),
    };
  }

  private async readRequired(reference: DocumentReference): Promise<UserProfile> {
    const snapshot = await reference.get();

    if (!snapshot.exists) {
      throw new IdentityError('USER_NOT_BOOTSTRAPPED');
    }

    return this.decode(snapshot);
  }

  private auditData(
    userId: string,
    requestId: string,
    action: 'user.bootstrapped' | 'user.profile.updated',
    version: number,
    changedFields: readonly string[],
  ): Record<string, unknown> {
    return {
      schemaVersion: 1,
      organizationId: null,
      actorId: userId,
      action,
      resourceType: 'user',
      resourceId: userId,
      requestId,
      outcome: 'success',
      createdAt: FieldValue.serverTimestamp(),
      summary: {
        version,
        changedFields: [...changedFields],
      },
    };
  }

  private async withStoreageErrors<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof IdentityError) {
        throw error;
      }

      this.logger.error('User profile persistence failed.');
      throw new IdentityError('PROFILE_UNAVAILABLE');
    }
  }
}
