import { FieldPath } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { AuditWriter } from '../../audit/services';
import { FirebaseService } from '../../firebase/services';
import { OrganizationScope } from '../../organizations/types';
import { DiagnosticError } from '../../observalibility/errors';
import { organizationInvitationConverter } from '../converters';
import { ORGANIZATION_INVITATIONS_COLLECTION } from '../constants';
import { organizationMembershipSchema } from '../../organizations/models';
import {
  OrganizationInvitation,
  organizationInvitationSchema,
} from '../models';
import {
  ApiException,
  RequestValidationException,
} from '../../common/exceptions';
import {
  OrganizationRepository,
  OrganizationmembershipRepository,
} from '../../organizations/repositories';
import {
  InvitationCreationResult,
  InvitationAcceptanceInput,
  InvitationAcceptanceResult,
} from '../types';
import {
  assertInvitationGrant,
  matchesInvitationToken,
  normalizeInvitationEmail,
} from '../utils';

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

  async acceptAuthorized(
    input: InvitationAcceptanceInput,
  ): Promise<InvitationAcceptanceResult> {
    const reference = this.invitationReference(input.invitationId);

    return this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<InvitationAcceptanceResult> => {
        const snapshot = await transaction.get(reference);
        const invitation = snapshot.data();

        if (!invitation) {
          throw invalidInvitation();
        }

        if (
          input.authorization.kind === 'email-link' &&
          !matchesInvitationToken(
            input.authorization.token,
            invitation.tokenHash,
          )
        ) {
          throw invalidInvitation();
        }

        if (
          invitation.recipientEmail !==
          normalizeInvitationEmail(input.verifiedEmail)
        ) {
          if (input.authorization.kind === 'verified-account') {
            // Do not disclose another recipient's invitation.
            throw invalidInvitation();
          }

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

  accept(input: {
    invitationId: string;
    token: string;
    recipientUid: string;
    verifiedEmail: string;
  }): Promise<InvitationAcceptanceResult> {
    return this.acceptAuthorized({
      invitationId: input.invitationId,
      recipientUid: input.recipientUid,
      verifiedEmail: input.verifiedEmail,
      authorization: {
        kind: 'email-link',
        token: input.token,
      },
    });
  }

  acceptReceived(input: {
    invitationId: string;
    recipientUid: string;
    verifiedEmail: string;
  }): Promise<InvitationAcceptanceResult> {
    return this.acceptAuthorized({
      ...input,
      authorization: {
        kind: 'verified-account',
      },
    });
  }

  async listPending(
    organizationId: string,
    cursor?: string,
  ): Promise<{
    items: OrganizationInvitation[];
    nextCursor: string | null;
  }> {
    const pageSize = 20;

    let query = this.collection()
      .where('scope.organizationId', '==', organizationId)
      .where('status', '==', 'PENDING')
      .where('expiresAt', '>', new Date())
      .orderBy('expiresAt', 'asc')
      .orderBy(FieldPath.documentId(), 'asc');

    if (cursor !== undefined) {
      const cursorSnapshot = await this.invitationReference(cursor).get();
      const cursorInvitation = cursorSnapshot.data();

      if (
        !cursorInvitation ||
        cursorInvitation.scope.organizationId !== organizationId
      ) {
        throw new RequestValidationException([
          {
            field: 'cursor',
            code: 'INVALID_VALUE',
          },
        ]);
      }

      query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.limit(pageSize + 1).get();
    const items = snapshot.docs
      .slice(0, pageSize)
      .map((document) => document.data());

    const lastInvitation = items.at(-1);

    return {
      items,
      nextCursor:
        snapshot.docs.length > pageSize && lastInvitation
          ? lastInvitation.id
          : null,
    };
  }

  async revoke(scope: OrganizationScope, invitationId: string): Promise<void> {
    const reference = this.invitationReference(invitationId);

    await this.firebaseService.firestore.runTransaction(
      async (transaction): Promise<void> => {
        const organizationSnapshot = await transaction.get(
          this.organizationsRepository.getDocumentReference(
            scope.organizationId,
          ),
        );

        const actorSnapshot = await transaction.get(
          this.organizationMembershipRepository.getDocumentReference(
            scope.organizationId,
            scope.actorUid,
          ),
        );

        const invitationSnapshot = await transaction.get(reference);

        const organization = organizationSnapshot.data();
        const actor = actorSnapshot.data();
        const invitation = invitationSnapshot.data();

        if (
          !organization ||
          !invitation ||
          invitation.scope.organizationId !== scope.organizationId
        ) {
          throw new ApiException(
            HttpStatus.NOT_FOUND,
            'ORGANIZATION_INVITATION_NOT_FOUND',
            'Invitation not found.',
          );
        }

        if (!actor) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'ORGANIZATION_PERMISSION_DENIED',
            'You cannot revoke invitations in this organization.',
          );
        }

        assertInvitationGrant(actor, invitation.role);

        if (invitation.status === 'REVOKED') {
          return;
        }

        if (invitation.status === 'ACCEPTED') {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'ORGANIZATION_INVITATION_ALREADY_ACCEPTED',
            'THis invitation has already been accepted.',
          );
        }

        const now = new Date();

        const revoked = organizationInvitationSchema.parse({
          ...invitation,
          status: 'REVOKED',
          revokedAt: now,
        });

        const event = this.auditWriter.prepareOrganizationInvitation({
          action: 'organization.invitation.revoked',
          actorUid: scope.actorUid,
          organizationId: scope.organizationId,
          invitationId: invitation.id,
          role: invitation.role,
          occurredAt: now,
        });

        transaction.set(reference, revoked);

        this.auditWriter.append(transaction, event);
      },
    );
  }

  async listReceived(
    recipientUid: string,
    verifiedEmail: string,
    cursor?: string,
  ) {
    const pageSize = 20;

    let query = this.collection()
      .where('recipientEmail', '==', verifiedEmail)
      .where('status', '==', 'PENDING')
      .where('expiresAt', '>', new Date())
      .orderBy('expiresAt', 'asc')
      .orderBy(FieldPath.documentId(), 'asc');

    if (cursor !== undefined) {
      const snapshot = await this.invitationReference(cursor).get();
      const invitation = snapshot.data();

      if (!invitation || invitation.recipientEmail !== verifiedEmail) {
        throw new RequestValidationException([
          { field: 'cursor', code: 'INVALID_VALUE' },
        ]);
      }

      query = query.startAfter(snapshot);
    }

    const snapshot = await query.limit(pageSize + 1).get();

    const invitations = snapshot.docs
      .slice(0, pageSize)
      .map((document) => document.data());

    const lastInvitation = invitations.at(-1);

    const nextCursor =
      snapshot.docs.length > pageSize && lastInvitation
        ? lastInvitation.id
        : null;

    if (invitations.length === 0) {
      return { items: [], nextCursor };
    }

    const organizationIds = [
      ...new Set(
        invitations.map((invitation) => invitation.scope.organizationId),
      ),
    ];

    const [organizationSnapshots, membershipSnapshots] = await Promise.all([
      this.firebaseService.firestore.getAll(
        ...organizationIds.map((id) =>
          this.organizationsRepository.getDocumentReference(id),
        ),
      ),
      this.firebaseService.firestore.getAll(
        ...organizationIds.map((id) =>
          this.organizationMembershipRepository.getDocumentReference(
            id,
            recipientUid,
          ),
        ),
      ),
    ]);

    const organizations = new Map(
      organizationSnapshots.map((document) => [document.id, document.data()]),
    );

    const joinedOrganizationIds = new Set(
      membershipSnapshots.flatMap((document) => {
        const membership = document.data();
        return membership ? [membership.organizationId] : [];
      }),
    );

    const items = invitations.flatMap((invitation) => {
      const organizationId = invitation.scope.organizationId;
      const organization = organizations.get(organizationId);

      // Hide invitations for deleted organizations or existing memberships.
      if (!organization || joinedOrganizationIds.has(organizationId)) {
        return [];
      }

      return [
        {
          id: invitation.id,
          organizationId,
          organizationName: organization.name,
          role: invitation.role,
          expiresAt: invitation.expiresAt.toISOString(),
        },
      ];
    });

    return { items, nextCursor };
  }
}
