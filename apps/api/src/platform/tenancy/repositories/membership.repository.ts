import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentSnapshot, Firestore } from 'firebase-admin/firestore';

import { FIRESTORE } from '@stagegate/backend-platform';

import { TenancyError } from '../utils';
import { MembershipStatus, type Membership } from '../types';
import { storedMembershipSchema } from './membership.schema';

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
      const snapshot = await this.firestore
        .collection('memberships')
        .doc(`${organizationId}_${userId}`)
        .get();

      if (!snapshot.exists) return null;

      const membership = this.decode(snapshot);

      if (membership.organizationId !== organizationId || membership.userId !== userId) {
        throw new TenancyError('TENANCY_DATA_INVALID');
      }

      return membership.status === MembershipStatus.ACTIVE ? membership : null;
    });
  }

  override listActiveForUser(userId: string): Promise<readonly Membership[]> {
    return this.withStorageErrors(async () => {
      const snapshot = await this.firestore
        .collection('memberships')
        .where('userId', '==', userId)
        .get();

      const memberships = snapshot.docs.map((document) => this.decode(document));

      if (memberships.some((membership) => membership.userId !== userId)) {
        throw new TenancyError('TENANCY_DATA_INVALID');
      }

      return memberships.filter((membership) => membership.status === MembershipStatus.ACTIVE);
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
