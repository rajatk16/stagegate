import { HttpStatus, Injectable } from '@nestjs/common';

import { AuditWriter } from '../../audit';
import { ApiException } from '../../common';
import { DiagnosticError } from '../../observalibility';
import { FirebaseService } from '../../firebase/services';
import { organizationInvitationConverter } from '../converters';
import { ORGANIZATION_INVITATIONS_COLLECTION } from '../constants';
import { InvitationAcceptanceResult, InvitationCreationResult } from '../types';
import {
  OrganizationInvitation,
  organizationInvitationSchema,
} from '../models';
import {
  assertInvitationGrant,
  matchesInvitationToken,
  normalizeInvitationEmail,
} from '../utils';
import {
  OrganizationRepository,
  organizationMembershipSchema,
  OrganizationmembershipRepository,
} from '../../organizations';

const invalidInvitation = (): ApiException =>
  new ApiException(
    HttpStatus.BAD_REQUEST,
    'ORGANIZATION_INVITATION_INVALID',
    'This invitation is invalid or no longer available.',
  );

@Injectable()
export class InvitationsRepository {
  constructor(
    private readonly auditWriter: AuditWriter,
    private readonly firebaseService: FirebaseService,
    private readonly organizationsRepository: OrganizationRepository,
    private readonly organizationMembershipRepository: OrganizationmembershipRepository,
  ) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(ORGANIZATION_INVITATIONS_COLLECTION)
      .withConverter(organizationInvitationConverter);
  }

  private invitationReference(id: string) {
    return this.collection().doc(id);
  }

  async create(
    candidate: OrganizationInvitation,
  ): Promise<InvitationCreationResult> {
    const invitation = organizationInvitationSchema.parse(candidate);

    if (
      invitation.status !== 'PENDING' ||
      invitation.acceptedByUid !== null ||
      invitation.acceptedAt !== null ||
      invitation.revokedAt !== null ||
      invitation.expiresAt.getTime() <= invitation.createdAt.getTime()
    ) {
      throw new DiagnosticError('INVITATION_STORAGE_INVARIANT_FAILED');
    }

    const organizationId = invitation.scope.organizationId;

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<InvitationCreationResult> => {
        const organizationSnapshot = await transaction.get(
          this.organizationsRepository.getDocumentReference(organizationId),
        );

        const inviterSnapshot = await transaction.get(
          this.organizationMembershipRepository.getDocumentReference(
            organizationId,
            invitation.createdByUid,
          ),
        );

        const organization = organizationSnapshot.data();
        const inviter = inviterSnapshot.data();

        if (!organization) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_NOT_FOUND',
            'Organization not found.',
          );
        }

        if (!inviter) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'ORGANIZATION_PERMISSION_DENIED',
            'You do not have permission to invite organization members.',
          );
        }

        assertInvitationGrant(inviter, invitation.role);

        const now = new Date();

        if (invitation.expiresAt.getTime() <= now.getTime()) {
          throw invalidInvitation();
        }

        const event = this.auditWriter.prepareOrganizationInvitation({
          action: 'organization.invitation.created',
          actorUid: invitation.createdByUid,
          organizationId,
          invitationId: invitation.id,
          role: invitation.role,
          occurredAt: now,
        });

        transaction.create(this.invitationReference(invitation.id), invitation);

        this.auditWriter.append(transaction, event);

        return {
          invitation,
          organizationName: organization.name,
        };
      },
    );
  }

  async revokeAfterDeliveryFailure(input: {
    invitationId: string;
    expectedTokenHash: string;
    actorUid: string;
  }): Promise<void> {
    const reference = this.invitationReference(input.invitationId);

    await this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<void> => {
        const snapshot = await transaction.get(reference);
        const invitation = snapshot.data();

        if (
          !invitation ||
          invitation.status !== 'PENDING' ||
          invitation.tokenHash !== input.expectedTokenHash ||
          invitation?.createdByUid !== input.actorUid
        ) {
          return;
        }

        const now = new Date();

        const revoked = organizationInvitationSchema.parse({
          ...invitation,
          status: 'REVOKED',
          revokedAt: now,
        });

        const event = this.auditWriter.prepareOrganizationInvitation({
          action: 'organization.invitation.revoked',
          actorUid: input.actorUid,
          organizationId: invitation.scope.organizationId,
          invitationId: invitation.id,
          role: invitation.role,
          occurredAt: now,
        });

        transaction.set(reference, revoked);
        this.auditWriter.append(transaction, event);
      },
    );
  }

  async accept(input: {
    invitationId: string;
    token: string;
    recipientUid: string;
    verifiedEmail: string;
  }): Promise<InvitationAcceptanceResult> {
    const reference = this.invitationReference(input.invitationId);

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<InvitationAcceptanceResult> => {
        const snapshot = await transaction.get(reference);
        const invitation = snapshot.data();

        if (
          !invitation ||
          !matchesInvitationToken(input.token, invitation.tokenHash)
        ) {
          throw invalidInvitation();
        }

        if (
          invitation.recipientEmail !==
          normalizeInvitationEmail(input.verifiedEmail)
        ) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'ORGANIZATION_INVITATION_RECIPIENT_MISMATCH',
            'Sign in with the email address this invitation was sent to.',
          );
        }

        const organizationId = invitation.scope.organizationId;

        const organizationSnapshot = await transaction.get(
          this.organizationsRepository.getDocumentReference(organizationId),
        );

        const recipientReference =
          this.organizationMembershipRepository.getDocumentReference(
            organizationId,
            input.recipientUid,
          );

        const recipientSnapshot = await transaction.get(recipientReference);

        const organization = organizationSnapshot.data();
        const existingMembership = recipientSnapshot.data();

        if (!organization) {
          throw invalidInvitation();
        }

        if (invitation.status === 'ACCEPTED') {
          if (
            invitation.acceptedByUid !== input.recipientUid ||
            !existingMembership
          ) {
            throw new ApiException(
              HttpStatus.CONFLICT,
              'ORGANIZATION_INVITATION_ALREADY_USED',
              'This invitation has already been used.',
            );
          }

          return {
            organizationId,
            membership: existingMembership,
            alreadyAccepted: true,
          };
        }

        if (
          invitation.status !== 'PENDING' ||
          invitation.expiresAt.getTime() <= Date.now()
        ) {
          throw invalidInvitation();
        }

        const inviterSnapshot = await transaction.get(
          this.organizationMembershipRepository.getDocumentReference(
            organizationId,
            invitation.createdByUid,
          ),
        );

        const inviter = inviterSnapshot.data();

        if (!inviter) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'ORGANIZATION_INVITATION_GRANT_UNAVAILABLE',
            'The invitation can no longer grant this membership',
          );
        }

        assertInvitationGrant(inviter, invitation.role);

        const now = new Date();

        if (invitation.expiresAt.getTime() <= now.getTime()) {
          throw invalidInvitation();
        }

        if (existingMembership) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'ORGANIZATION_ALREADY_MEMBER',
            'You are already a member of this organization.',
          );
        }

        const membership = organizationMembershipSchema.parse({
          organizationId,
          uid: input.recipientUid,
          role: invitation.role,
          createdAt: now,
          updatedAt: now,
        });

        const accepted = organizationInvitationSchema.parse({
          ...invitation,
          status: 'ACCEPTED',
          acceptedByUid: input.recipientUid,
          acceptedAt: now,
        });

        const event = this.auditWriter.prepareOrganizationInvitation({
          action: 'organization.invitation.accepted',
          actorUid: input.recipientUid,
          organizationId,
          invitationId: invitation.id,
          role: invitation.role,
          occurredAt: now,
        });

        transaction.create(recipientReference, membership);
        transaction.set(reference, accepted);
        this.auditWriter.append(transaction, event);

        return {
          organizationId,
          membership,
          alreadyAccepted: false,
        };
      },
    );
  }
}
