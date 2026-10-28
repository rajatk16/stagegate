import { FieldPath, Transaction } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { EventScope } from '../../events/types';
import { EVENT_STATUS } from '../../events/enums';
import { AuditWriter } from '../../audit/services';
import { canGrantEventRole } from '../../events/utils';
import { FirebaseService } from '../../firebase/services';
import { eventMembershipSchema } from '../../events/models';
import { OrganizationScope } from '../../organizations/types';
import { EventAccessService } from '../../events/services/eventAccess.service';
import { DiagnosticError } from '../../observalibility/errors';
import { organizationInvitationConverter } from '../converters';
import { ORGANIZATION_INVITATIONS_COLLECTION } from '../constants';
import { EventMembershipRepository } from '../../events/repositories/eventMembership.repository';
import { organizationMembershipSchema } from '../../organizations/models';
import { ORGANIZATION_MEMBERSHIP_STATUS } from '../../organizations/enums';
import { assertActiveOrganizationMembership } from '../../organizations/utils';
import {
  ApiException,
  RequestValidationException,
} from '../../common/exceptions';
import {
  OrganizationRepository,
  OrganizationMembershipRepository,
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
import {
  Invitation,
  EventInvitation,
  invitationSchema,
  isEventInvitation,
  eventInvitationSchema,
  OrganizationInvitation,
  isOrganizationInvitation,
  organizationInvitationSchema,
} from '../models';

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
    private readonly eventAccessService: EventAccessService,
    private readonly organizationsRepository: OrganizationRepository,
    private readonly eventMembershipRepository: EventMembershipRepository,
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
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

        const revoked = invitationSchema.parse({
          ...invitation,
          status: 'REVOKED',
          revokedAt: now,
        });

        const event = this.prepareInvitationAudit(
          invitation,
          'revoked',
          input.actorUid,
          now,
        );

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

        if (isEventInvitation(invitation)) {
          return this.acceptEventInTransaction(transaction, input, invitation);
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

          assertActiveOrganizationMembership(existingMembership);

          return {
            scopeType: 'ORGANIZATION',
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
          status: ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE,
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
          scopeType: 'ORGANIZATION',
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
      .where('scope.type', '==', 'ORGANIZATION')
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
        !isOrganizationInvitation(cursorInvitation) ||
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
      .map((document) => document.data())
      .filter(isOrganizationInvitation);

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
          !isOrganizationInvitation(invitation) ||
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

    const enriched = await Promise.all(
      invitations.map(async (invitation) => {
        const organizationId = invitation.scope.organizationId;

        const organizationSnapshot = await this.organizationsRepository
          .getDocumentReference(organizationId)
          .get();

        const organization = organizationSnapshot.data();

        if (!organization) {
          return null;
        }

        const organizationMembership =
          await this.organizationMembershipRepository.findByOrganizationAndUser(
            organizationId,
            recipientUid,
          );

        if (isEventInvitation(invitation)) {
          if (
            organizationMembership &&
            organizationMembership.status !== 'ACTIVE'
          ) {
            return null;
          }

          const eventSnapshot = await this.eventAccessService
            .getEventReference(organizationId, invitation.scope.eventId)
            .get();

          const event = eventSnapshot.data();

          const eventMembership =
            await this.eventMembershipRepository.findByEventAndUser(
              organizationId,
              invitation.scope.eventId,
              recipientUid,
            );

          if (
            !event ||
            event.status === EVENT_STATUS.ARCHIVED ||
            eventMembership
          ) {
            return null;
          }

          return {
            id: invitation.id,
            scopeType: 'EVENT' as const,
            organizationId,
            organizationName: organization.name,
            eventId: invitation.scope.eventId,
            eventName: event.name,
            role: invitation.role,
            expiresAt: invitation.expiresAt.toISOString(),
          };
        }

        if (organizationMembership) {
          return null;
        }

        return {
          id: invitation.id,
          scopeType: 'ORGANIZATION' as const,
          organizationId,
          organizationName: organization.name,
          role: invitation.role,
          expiresAt: invitation.expiresAt.toISOString(),
        };
      }),
    );
    return {
      items: enriched.filter((item) => item !== null),
      nextCursor,
    };
  }

  private prepareInvitationAudit(
    invitation: Invitation,
    action: 'created' | 'accepted' | 'revoked',
    actorUid: string,
    occurredAt: Date,
  ) {
    if (isEventInvitation(invitation)) {
      return this.auditWriter.prepareEventMembership({
        action: `event.invitation.${action}`,
        targetType: 'eventInvitation',
        actorUid,
        organizationId: invitation.scope.organizationId,
        targetEventId: invitation.scope.eventId,
        invitationId: invitation.id,
        role: invitation.role,
        occurredAt,
      });
    }

    return this.auditWriter.prepareOrganizationInvitation({
      action: `organization.invitation.${action}`,
      actorUid,
      organizationId: invitation.scope.organizationId,
      invitationId: invitation.id,
      role: invitation.role,
      occurredAt,
    });
  }

  async createEvent(scope: EventScope, candidate: EventInvitation) {
    const invitation = eventInvitationSchema.parse(candidate);

    if (
      invitation.createdByUid !== scope.actorUid ||
      invitation.scope.organizationId !== scope.organizationId ||
      invitation.scope.eventId !== scope.eventId ||
      invitation.status !== 'PENDING' ||
      invitation.acceptedByUid !== null ||
      invitation.acceptedAt !== null ||
      invitation.revokedAt !== null
    ) {
      throw new DiagnosticError('INVITATION_STORAGE_INVARIANT_FAILED');
    }

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const current = await this.eventAccessService.requireInTransaction(
          transaction,
          scope,
          ['event:members:manage'],
        );

        if (current.event.status === EVENT_STATUS.ARCHIVED) {
          throw new ApiException(
            HttpStatus.CONFLICT,
            'EVENT_ARCHIVED',
            'Archived events cannot receive new invitations.',
          );
        }

        if (!canGrantEventRole(current.authority, invitation.role)) {
          throw new ApiException(
            HttpStatus.FORBIDDEN,
            'EVENT_INVITATION_ROLE_FORBIDDEN',
            'You cannot invite someone with this event role.',
          );
        }

        const organizationSnapshot = await transaction.get(
          this.organizationsRepository.getDocumentReference(
            scope.organizationId,
          ),
        );

        const organization = organizationSnapshot.data();

        if (!organization) {
          throw invalidInvitation();
        }

        const now = new Date();

        if (invitation.expiresAt.getTime() <= now.getTime()) {
          throw invalidInvitation();
        }

        const audit = this.prepareInvitationAudit(
          invitation,
          'created',
          scope.actorUid,
          now,
        );

        transaction.create(this.invitationReference(invitation.id), invitation);

        this.auditWriter.append(transaction, audit);

        return {
          invitation,
          organizationName: organization.name,
          eventName: current.event.name,
        };
      },
    );
  }

  private async acceptEventInTransaction(
    transaction: Transaction,
    input: InvitationAcceptanceInput,
    invitation: EventInvitation,
  ): Promise<InvitationAcceptanceResult> {
    const identity = {
      actorUid: input.recipientUid,
      organizationId: invitation.scope.organizationId,
      eventId: invitation.scope.eventId,
    };

    const recipient = await this.eventAccessService.loadInTransaction(
      transaction,
      identity,
    );

    if (recipient.organizationMembership) {
      assertActiveOrganizationMembership(recipient.organizationMembership);
    }

    const existing = recipient.eventMembership;

    if (invitation.status === 'ACCEPTED') {
      if (invitation.acceptedByUid !== input.recipientUid || !existing) {
        throw new ApiException(
          HttpStatus.CONFLICT,
          'EVENT_INVITATION_ALREADY_USED',
          'This invitation has already been used.',
        );
      }

      if (existing.status !== 'ACTIVE') {
        throw new ApiException(
          HttpStatus.FORBIDDEN,
          'EVENT_MEMBERSHIP_INACTIVE',
          'An active event membership is required.',
        );
      }

      return {
        scopeType: 'EVENT',
        organizationId: identity.organizationId,
        eventId: identity.eventId,
        membership: existing,
        alreadyAccepted: true,
      };
    }

    if (
      invitation.status !== 'PENDING' ||
      invitation.expiresAt.getTime() <= Date.now()
    ) {
      throw invalidInvitation();
    }

    if (recipient.event.status === EVENT_STATUS.ARCHIVED) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'EVENT_ARCHIVED',
        'Archived events cannot accept new memberships.',
      );
    }

    const inviter = await this.eventAccessService.requireInTransaction(
      transaction,
      {
        ...identity,
        actorUid: invitation.createdByUid,
      },
      ['event:members:manage'],
    );

    if (!canGrantEventRole(inviter.authority, invitation.role)) {
      throw new ApiException(
        HttpStatus.FORBIDDEN,
        'EVENT_INVITATION_GRANT_UNAVAILABLE',
        'The invitation can no longer grant this membership.',
      );
    }

    if (existing) {
      throw new ApiException(
        HttpStatus.CONFLICT,
        'EVENT_ALREADY_MEMBER',
        'You already have membership in this event.',
      );
    }

    const now = new Date();

    if (invitation.expiresAt.getTime() <= now.getTime()) {
      throw invalidInvitation();
    }

    const membership = eventMembershipSchema.parse({
      organizationId: identity.organizationId,
      eventId: identity.eventId,
      uid: input.recipientUid,
      role: invitation.role,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    const accepted = eventInvitationSchema.parse({
      ...invitation,
      status: 'ACCEPTED',
      acceptedByUid: input.recipientUid,
      acceptedAt: now,
    });

    const acceptedAudit = this.prepareInvitationAudit(
      invitation,
      'accepted',
      input.recipientUid,
      now,
    );

    const joinedAudit = this.auditWriter.prepareEventMembership({
      action: 'event.member.joined',
      targetType: 'eventMembership',
      actorUid: input.recipientUid,
      organizationId: identity.organizationId,
      targetEventId: identity.eventId,
      targetUid: input.recipientUid,
      role: membership.role,
      occurredAt: now,
    });

    transaction.create(
      this.eventMembershipRepository.getDocumentReference(
        identity.organizationId,
        identity.eventId,
        input.recipientUid,
      ),
      membership,
    );

    transaction.set(this.invitationReference(invitation.id), accepted);

    this.auditWriter.append(transaction, acceptedAudit);
    this.auditWriter.append(transaction, joinedAudit);

    return {
      scopeType: 'EVENT',
      organizationId: identity.organizationId,
      eventId: identity.eventId,
      membership,
      alreadyAccepted: false,
    };
  }

  async listEventPending(scope: EventScope, cursor?: string) {
    const pageSize = 20;

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const current = await this.eventAccessService.requireInTransaction(
          transaction,
          scope,
          ['event:members:manage'],
        );

        let query = this.collection()
          .where('scope.type', '==', 'EVENT')
          .where('scope.organizationId', '==', scope.organizationId)
          .where('scope.eventId', '==', scope.eventId)
          .where('status', '==', 'PENDING')
          .where('expiresAt', '>', new Date())
          .orderBy('expiresAt', 'asc')
          .orderBy(FieldPath.documentId(), 'asc');

        if (cursor !== undefined) {
          const anchor = await transaction.get(
            this.invitationReference(cursor),
          );

          const invitation = anchor.data();

          if (
            !invitation ||
            !isEventInvitation(invitation) ||
            invitation.scope.organizationId !== scope.organizationId ||
            invitation.scope.eventId !== scope.eventId
          ) {
            throw new RequestValidationException([
              {
                field: 'cursor',
                code: 'INVALID_VALUE',
              },
            ]);
          }

          query = query.startAfter(anchor);
        }

        const snapshot = await transaction.get(query.limit(pageSize + 1));

        const invitations = snapshot.docs
          .slice(0, pageSize)
          .map((document) => document.data())
          .filter(isEventInvitation);

        return {
          items: invitations.map((invitation) => ({
            id: invitation.id,
            organizationId: invitation.scope.organizationId,
            eventId: invitation.scope.eventId,
            recipientEmail: invitation.recipientEmail,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt.toISOString(),
            canRevoke: canGrantEventRole(current.authority, invitation.role),
          })),
          nextCursor:
            snapshot.docs.length > pageSize
              ? (invitations.at(-1)?.id ?? null)
              : null,
        };
      },
    );
  }

  async revokeEvent(scope: EventScope, invitationId: string): Promise<void> {
    await this.firebaseService.firestore.runTransaction(async (transaction) => {
      const current = await this.eventAccessService.requireInTransaction(
        transaction,
        scope,
        ['event:members:manage'],
      );

      const reference = this.invitationReference(invitationId);

      const snapshot = await transaction.get(reference);
      const invitation = snapshot.data();

      if (
        !invitation ||
        !isEventInvitation(invitation) ||
        invitation.scope.organizationId !== scope.organizationId ||
        invitation.scope.eventId !== scope.eventId
      ) {
        throw new ApiException(
          HttpStatus.NOT_FOUND,
          'EVENT_INVITATION_NOT_FOUND',
          'Invitation not found.',
        );
      }

      if (!canGrantEventRole(current.authority, invitation.role)) {
        throw new ApiException(
          HttpStatus.FORBIDDEN,
          'EVENT_INVITATION_ROLE_FORBIDDEN',
          'You cannot revoke invitations for this role.',
        );
      }

      if (invitation.status === 'REVOKED') {
        return;
      }

      if (invitation.status === 'ACCEPTED') {
        throw new ApiException(
          HttpStatus.CONFLICT,
          'EVENT_INVITATION_ALREADY_ACCEPTED',
          'This invitation has already been accepted.',
        );
      }

      const now = new Date();

      const revoked = eventInvitationSchema.parse({
        ...invitation,
        status: 'REVOKED',
        revokedAt: now,
      });

      const audit = this.prepareInvitationAudit(
        invitation,
        'revoked',
        scope.actorUid,
        now,
      );

      transaction.set(reference, revoked);
      this.auditWriter.append(transaction, audit);
    });
  }
}
