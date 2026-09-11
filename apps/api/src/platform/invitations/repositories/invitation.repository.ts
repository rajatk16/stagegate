import { z } from 'zod';
import { FIRESTORE } from '@stagegate/backend-platform';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  DocumentSnapshot,
  FieldValue,
  Firestore,
  Timestamp,
} from 'firebase-admin/firestore';

import {
  CreateInvitationInput,
  invitationEmailSchema,
  INIVITATION_LIFETIME_MS,
  AcceptedInvitationResponse,
} from '../types';
import {
  Membership,
  TenancyError,
  MembershipRole,
  MembershipStatus,
  storedMembershipSchema,
  OrganizationPolicyService,
} from '../../tenancy';

const userIdSchema = z
  .string()
  .min(1)
  .max(128)
  .refine(
    (value) =>
      !value.includes('/') &&
      value !== '.' &&
      value !== '..' &&
      !/^__.*__$/.test(value),
  );

const storedInvitationSchema = z
  .object({
    invitationId: z.string().regex(/^[a-f0-9]{64}$/),
    organizationId: z.string().regex(/^[A-Za-z0-9]{20}$/),
    email: invitationEmailSchema,
    role: z.enum(MembershipRole),
    status: z.enum(['PENDING', 'ACCEPTED']),
    expiresAt: z.instanceof(Timestamp),
    acceptedAt: z.instanceof(Timestamp).nullable(),
    acceptedBy: userIdSchema.nullable(),
    schemaVersion: z.literal(1),
    createdAt: z.instanceof(Timestamp),
    updatedAt: z.instanceof(Timestamp),
    createdBy: userIdSchema,
    updatedBy: userIdSchema,
  })
  .refine((value) =>
    value.status === 'PENDING'
      ? value.acceptedAt === null && value.acceptedBy === null
      : value.acceptedAt !== null && value.acceptedBy !== null,
  );

@Injectable()
export class InvitationRepository {
  private readonly logger = new Logger(InvitationRepository.name);

  constructor(
    @Inject(FIRESTORE)
    private readonly firestore: Firestore,
    private readonly policy: OrganizationPolicyService,
  ) {}

  create(
    invitationId: string,
    organizationId: string,
    actorId: string,
    input: CreateInvitationInput,
    requestId: string,
  ): Promise<{ expiresAt: string }> {
    return this.withStorageErrors(async () => {
      this.assertUserId(actorId);

      const organizationReference = this.firestore
        .collection('organizations')
        .doc(organizationId);

      const inviteReference = this.firestore
        .collection('memberships')
        .doc(`${organizationId}_${actorId}`);

      const invitationReference = this.firestore
        .collection('invitations')
        .doc(invitationId);

      const auditReference = this.firestore.collection('auditLogs').doc();

      return this.firestore.runTransaction(async (transaction) => {
        const organizationSnapshot = await transaction.get(
          organizationReference,
        );

        const inviterSnapshot = await transaction.get(inviteReference);

        this.policy.assertCanInvite(
          this.decodeMembership(inviterSnapshot),
          actorId,
          organizationId,
          input.role,
        );

        if (!organizationSnapshot.exists) {
          throw new TenancyError('ORGANIZATION_NOT_FOUND');
        }

        if (organizationSnapshot.get('organizationId') !== organizationId) {
          throw new TenancyError('TENANCY_DATA_INVALID');
        }

        const expiresAt = Timestamp.fromMillis(
          Date.now() + INIVITATION_LIFETIME_MS,
        );

        transaction.create(invitationReference, {
          invitationId,
          organizationId,
          email: input.email,
          role: input.role,
          status: 'PENDING',
          expiresAt,
          acceptedAt: null,
          acceptedBy: null,
          schemaVersion: 1,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdBy: actorId,
          updatedBy: actorId,
        });

        transaction.create(auditReference, {
          schemaVersion: 1,
          organizationId,
          actorId,
          action: 'invitation.created',
          resourceType: 'invitation',
          resourceId: invitationId,
          requestId,
          outcome: 'success',
          createdAt: FieldValue.serverTimestamp(),
          summary: {
            role: input.role,
            expiresAt,
          },
        });

        return {
          expiresAt: expiresAt.toDate().toISOString(),
        };
      });
    });
  }

  accept(
    invitationId: string,
    actorId: string,
    verifiedEmail: string,
    requestId: string,
  ): Promise<AcceptedInvitationResponse> {
    return this.withStorageErrors(async () => {
      this.assertUserId(actorId);

      const invitationReference = this.firestore
        .collection('invitations')
        .doc(invitationId);

      const auditReference = this.firestore.collection('auditLogs').doc();

      return this.firestore.runTransaction(async (transaction) => {
        const invitationSnapshot = await transaction.get(invitationReference);

        if (!invitationSnapshot.exists) {
          throw new TenancyError('INVITATION_UNAVAILABLE');
        }

        const result = storedInvitationSchema.safeParse(
          invitationSnapshot.data(),
        );

        if (
          !result.success ||
          result.data.invitationId !== invitationSnapshot.id
        ) {
          throw new TenancyError('TENANCY_DATA_INVALID');
        }

        const invitation = result.data;

        if (
          invitation.status !== 'PENDING' ||
          invitation.expiresAt.toMillis() < Date.now()
        ) {
          throw new TenancyError('INVITATION_UNAVAILABLE');
        }

        if (invitation.email !== verifiedEmail) {
          throw new TenancyError('INVITATION_EMAIL_MISMATCH');
        }

        const { organizationId } = invitation;
        const membershipId = `${organizationId}_${actorId}`;

        const organizationReference = this.firestore
          .collection('organizations')
          .doc(organizationId);

        const inviterReference = this.firestore
          .collection('memberships')
          .doc(`${organizationId}_${invitation.createdBy}`);

        const recipientReference = this.firestore
          .collection('memberships')
          .doc(membershipId);

        const profileReference = this.firestore
          .collection('users')
          .doc(actorId);

        const organizationSnapshot = await transaction.get(
          organizationReference,
        );
        const inviterSnapshot = await transaction.get(inviterReference);
        const profileSnapshot = await transaction.get(profileReference);
        const recipientSnapshot = await transaction.get(recipientReference);

        if (!organizationSnapshot.exists) {
          throw new TenancyError('INVITATION_UNAVAILABLE');
        }

        if (organizationSnapshot.get('organizationId') !== organizationId) {
          throw new TenancyError('TENANCY_DATA_INVALID');
        }

        try {
          this.policy.assertCanInvite(
            this.decodeMembership(inviterSnapshot),
            invitation.createdBy,
            organizationId,
            invitation.role,
          );
        } catch (error) {
          if (
            error instanceof TenancyError &&
            (error.code === 'ORGANIZATION_NOT_FOUND' ||
              error.code === 'PERMISSION_DENIED')
          ) {
            throw new TenancyError('INVITATION_UNAVAILABLE');
          }

          throw error;
        }

        if (!profileSnapshot.exists) {
          throw new TenancyError('ACTOR_NOT_BOOTSTRAPPED');
        }

        if (recipientSnapshot.exists) {
          throw new TenancyError('MEMBERSHIP_ALREADY_EXISTS');
        }

        if (invitation.expiresAt.toMillis() < Date.now()) {
          throw new TenancyError('INVITATION_UNAVAILABLE');
        }

        transaction.create(recipientReference, {
          membershipId,
          organizationId,
          userId: actorId,
          role: invitation.role,
          status: MembershipStatus.ACTIVE,
          version: 1,
          schemaVersion: 1,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          createdBy: actorId,
          updatedBy: actorId,
        });

        transaction.update(invitationReference, {
          status: 'ACCEPTED',
          acceptedAt: FieldValue.serverTimestamp(),
          acceptedBy: actorId,
          updatedAt: FieldValue.serverTimestamp(),
          updatedBy: actorId,
        });

        transaction.create(auditReference, {
          schemaVersion: 1,
          organizationId,
          actorId,
          action: 'invitation.accepted',
          resourceType: 'invitation',
          resourceId: invitationId,
          requestId,
          outcome: 'success',
          createdAt: FieldValue.serverTimestamp(),
          summary: {
            membershipId,
            role: invitation.role,
            invitedBy: invitation.createdBy,
          },
        });

        return {
          organizationId,
          membershipId,
          role: invitation.role,
          status: MembershipStatus.ACTIVE,
        };
      });
    });
  }

  private decodeMembership(snapshot: DocumentSnapshot): Membership | null {
    if (!snapshot.exists) {
      return null;
    }

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

  private assertUserId(userId: string): void {
    if (!userIdSchema.safeParse(userId).success) {
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

      this.logger.error('Invitation persistence failed.');
      throw new TenancyError('TENANCY_UNAVAILABLE');
    }
  }
}
