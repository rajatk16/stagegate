import { z } from 'zod';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentSnapshot, Firestore, Timestamp } from 'firebase-admin/firestore';

import { FIRESTORE } from '@stagegate/backend-platform';

import { TenancyError } from '../utils';
import { type Membership } from '../types';

const storedMembershipSchema = z.object({
  membershipId: z.string().min(1),
  organizationId: z.string().min(1),
  userId: z.string().min(1).max(128),
  role: z.literal('OWNER'),
  status: z.literal('ACTIVE'),
  version: z.number().int().positive(),
  schemaVersion: z.literal(1),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
});

export abstract class MembershipRepository {
  abstract findActive(organizationId: string, userId: string): Promise<Membership | null>;

  abstract listActiveForUser(userId: string): Promise<readonly Membership[]>;
}

@Injectable()
export class FirestoreMembershipRepository extends MembershipRepository {
  private readonly logger = new Logger(FirestoreMembershipRepository.name);

  constructor(
    @Inject(FIRESTORE)
    private readonly firestore: Firestore,
  ) {
    super();
  }

  override findActive(organizationId: string, userId: string): Promise<Membership | null> {
    return this.withStorageErrors(async () => {
      const membershipId = `${organizationId}_${userId}`;

      const snapshot = await this.firestore.collection('memberships').doc(membershipId).get();

      if (!snapshot.exists) return null;

      const membership = this.decode(snapshot);

      return membership;
    });
  }

  override listActiveForUser(userId: string): Promise<readonly Membership[]> {
    return this.withStorageErrors(async () => {
      const snapshot = await this.firestore
        .collection('memberships')
        .where('userId', '==', userId)
        .get();

      return snapshot.docs.map((document) => this.decode(document));
    });
  }

  private decode(snapshot: DocumentSnapshot): Membership {
    const result = storedMembershipSchema.safeParse(snapshot.data());

    if (
      !result.success ||
      result.data.membershipId !== snapshot.id ||
      snapshot.id !== `${result.data.organizationId}_${result.data.userId}`
    ) {
      throw new TenancyError('TENANCY_DATA_INVALID');
    }

    return {
      membershipId: result.data.membershipId,
      organizationId: result.data.organizationId,
      userId: result.data.userId,
      role: result.data.role,
      status: result.data.status,
      version: result.data.version,
      createdAt: result.data.createdAt.toDate(),
      updatedAt: result.data.updatedAt.toDate(),
    };
  }

  private async withStorageErrors<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof TenancyError) {
        throw error;
      }

      this.logger.error('Membership persistence failed.');
      throw new TenancyError('TENANCY_UNAVAILABLE');
    }
  }
}
