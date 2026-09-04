import { z } from 'zod';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DocumentSnapshot, FieldValue, Firestore, Timestamp } from 'firebase-admin/firestore';

import { FIRESTORE } from '@stagegate/backend-platform';

import { TenancyError } from '../utils';
import { Membership, type Organization, type OrganizationContext } from '../types';

const storedOrganizationSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(2).max(120),
  version: z.number().int().positive(),
  schemaVersion: z.literal(1),
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),
});

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

export abstract class OrganizationRepository {
  abstract createWithOwner(
    name: string,
    actorId: string,
    requestId: string,
  ): Promise<OrganizationContext>;

  abstract find(organizationId: string): Promise<Organization | null>;

  abstract findMany(organizationIds: readonly string[]): Promise<readonly Organization[]>;
}

@Injectable()
export class FirestoreOrganizationRepository extends OrganizationRepository {
  private readonly logger = new Logger(FirestoreOrganizationRepository.name);

  constructor(
    @Inject(FIRESTORE)
    private readonly firestore: Firestore,
  ) {
    super();
  }

  override createWithOwner(
    name: string,
    actorId: string,
    requestId: string,
  ): Promise<OrganizationContext> {
    return this.withStorageErrors(async () => {
      this.assertDocumentSegment(actorId);

      const userReference = this.firestore.collection('users').doc(actorId);
      const organizationReference = this.firestore.collection('organizations').doc();

      const membershipId = this.membershipId(organizationReference.id, actorId);

      const membershipReference = this.firestore.collection('memberships').doc(membershipId);

      const auditReference = this.firestore.collection('auditLogs').doc();

      await this.firestore.runTransaction(async (transaction) => {
        const userSnapshot = await transaction.get(userReference);

        if (!userSnapshot.exists) {
          throw new TenancyError('ACTOR_NOT_BOOTSTRAPPED');
        }

        const timestamps = {
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };

        transaction.set(organizationReference, {
          organizationId: organizationReference.id,
          name,
          version: 1,
          schemaVersion: 1,
          ...timestamps,
          createdBy: actorId,
          updatedBy: actorId,
        });

        transaction.set(membershipReference, {
          membershipId,
          organizationId: organizationReference.id,
          userId: actorId,
          role: 'OWNER',
          status: 'ACTIVE',
          version: 1,
          schemaVersion: 1,
          ...timestamps,
          createdBy: actorId,
          updatedBy: actorId,
        });

        transaction.set(auditReference, {
          schemaVersion: 1,
          organizationId: organizationReference.id,
          actorId,
          action: 'organization.created',
          resourceType: 'organization',
          resourceId: organizationReference.id,
          requestId,
          outcome: 'success',
          createdAt: FieldValue.serverTimestamp(),
          summary: {
            organizationName: name,
            ownerMembershipId: membershipId,
          },
        });
      });

      const [organizationSnapshot, membershipSnapshot] = await Promise.all([
        organizationReference.get(),
        membershipReference.get(),
      ]);

      return {
        organization: this.decodeOrganization(organizationSnapshot),
        membership: this.decodeMembership(membershipSnapshot),
      };
    });
  }

  override find(organizationId: string): Promise<Organization | null> {
    return this.withStorageErrors(async () => {
      const snapshot = await this.firestore.collection('organizations').doc(organizationId).get();

      return snapshot.exists ? this.decodeOrganization(snapshot) : null;
    });
  }

  override findMany(organizationIds: readonly string[]): Promise<readonly Organization[]> {
    return this.withStorageErrors(async () => {
      if (organizationIds.length === 0) {
        return [];
      }

      const references = organizationIds.map((organizationId) =>
        this.firestore.collection('organizations').doc(organizationId),
      );

      const snapshots = await this.firestore.getAll(...references);

      return snapshots.map((snapshot) => {
        if (!snapshot.exists) {
          throw new TenancyError('TENANCY_DATA_INVALID');
        }

        return this.decodeOrganization(snapshot);
      });
    });
  }

  private decodeOrganization(snapshot: DocumentSnapshot): Organization {
    const result = storedOrganizationSchema.safeParse(snapshot.data());

    if (!snapshot.exists || !result.success || result.data.organizationId !== snapshot.id) {
      throw new TenancyError('TENANCY_DATA_INVALID');
    }

    return {
      organizationId: result.data.organizationId,
      name: result.data.name,
      version: result.data.version,
      createdAt: result.data.createdAt.toDate(),
      updatedAt: result.data.updatedAt.toDate(),
    };
  }

  private decodeMembership(snapshot: DocumentSnapshot): Membership {
    const result = storedMembershipSchema.safeParse(snapshot.data());

    if (!snapshot.exists || !result.success || result.data.membershipId !== snapshot.id) {
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

  private membershipId(organizationId: string, userId: string): string {
    return `${organizationId}_${userId}`;
  }

  private assertDocumentSegment(value: string): void {
    if (
      value.length === 0 ||
      value.length > 128 ||
      value.includes('/') ||
      value === '.' ||
      value === '..' ||
      /^__.*__$/.test(value)
    ) {
      throw new TenancyError('TENANCY_DATA_INVALID');
    }
  }

  private async withStorageErrors<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof TenancyError) {
        throw error;
      }

      this.logger.error('Organization persistence failed.');
      throw new TenancyError('TENANCY_UNAVAILABLE');
    }
  }
}
