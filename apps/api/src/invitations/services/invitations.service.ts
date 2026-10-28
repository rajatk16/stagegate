import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';

import { Environment } from '../../config';
import { EventScope } from '../../events/types';
import { toAuthException } from '../../auth/mappers';
import { InvitationsRepository } from '../repositories';
import { FirebaseService } from '../../firebase/services';
import { toDiagnostic } from '../../observalibility/mappers';
import { OrganizationScope } from '../../organizations/types';
import { ApiException, AuthException } from '../../common/exceptions';
import { assertOrganizationPermissions } from '../../organizations/utils';
import { createInvitationToken, normalizeInvitationEmail } from '../utils';
import { InvitationAcceptanceResult, InvitationIssueResult } from '../types';
import { EmailReceipt, TransactionalEmailProvider } from '../../email/types';
import { ORGANIZATION_ROLE_CHANGE_TARGETS } from '../../organizations/constants';
import {
  CreateEventInvitationDto,
  CreateOrganizationInvitationDto,
} from '../dtos';

import {
  Invitation,
  eventInvitationSchema,
  INVITABLE_ORGANIZATION_ROLES,
  organizationInvitationSchema,
} from '../models';

@Injectable()
export class InvitationsService {
  private readonly logger = new ConsoleLogger(InvitationsService.name, {
    json: true,
    colors: false,
  });

  constructor(
    private readonly invitationsRepository: InvitationsRepository,
    private readonly emailProvider: TransactionalEmailProvider,
    private readonly firebaseService: FirebaseService,
    private readonly config: ConfigService<Environment, true>,
  ) {}

  async create(
    scope: OrganizationScope,
    dto: CreateOrganizationInvitationDto,
  ): Promise<InvitationIssueResult> {
    const { token, tokenHash } = createInvitationToken();

    const now = new Date();

    const ttlHours = this.config.getOrThrow('INVITATION_TTL_HOURS', {
      infer: true,
    });

    const invitation = organizationInvitationSchema.parse({
      id: randomUUID(),

      scope: {
        type: 'ORGANIZATION',
        organizationId: scope.organizationId,
      },

      recipientEmail: normalizeInvitationEmail(dto.email),
      role: dto.role,
      tokenHash,

      status: 'PENDING',
      createdByUid: scope.actorUid,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlHours * 60 * 60 * 1000),

      acceptedByUid: null,
      acceptedAt: null,
      revokedAt: null,
    });

    const creation = await this.invitationsRepository.create(invitation);

    const emailStatus = await this.deliverInvitation(invitation, token, {
      organizationName: creation.organizationName,
    });

    return {
      ...creation,
      emailStatus,
    };
  }

  async accept(
    user: DecodedIdToken,
    invitationId: string,
    token: string,
  ): Promise<InvitationAcceptanceResult> {
    const recipient = await this.getVerifiedRecipient(user);

    return this.invitationsRepository.accept({
      invitationId,
      token,
      recipientUid: recipient.uid,
      verifiedEmail: recipient.email,
    });
  }

  async listPending(scope: OrganizationScope, cursor?: string) {
    assertOrganizationPermissions(scope.membership, [
      'organization:members:manage',
    ]);

    const grantableRoles =
      ORGANIZATION_ROLE_CHANGE_TARGETS[scope.membership.role];

    const allowedRoles = Object.values(INVITABLE_ORGANIZATION_ROLES).filter(
      (role) => grantableRoles.includes(role),
    );

    const page = await this.invitationsRepository.listPending(
      scope.organizationId,
      cursor,
    );

    return {
      items: page.items.map((invitation) => ({
        id: invitation.id,
        organizationId: invitation.scope.organizationId,
        recipientEmail: invitation.recipientEmail,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expiresAt.toISOString(),
        canRevoke: allowedRoles.includes(invitation.role),
      })),
      nextCursor: page.nextCursor,
      allowedRoles,
    };
  }

  async revoke(scope: OrganizationScope, invitationId: string): Promise<void> {
    assertOrganizationPermissions(scope.membership, [
      'organization:members:manage',
    ]);

    await this.invitationsRepository.revoke(scope, invitationId);
  }

  async listReceived(user: DecodedIdToken, cursor?: string) {
    const recipient = await this.getVerifiedRecipient(user);

    return this.invitationsRepository.listReceived(
      recipient.uid,
      recipient.email,
      cursor,
    );
  }

  async acceptReceived(
    user: DecodedIdToken,
    invitationId: string,
  ): Promise<InvitationAcceptanceResult> {
    const recipient = await this.getVerifiedRecipient(user);

    return this.invitationsRepository.acceptReceived({
      invitationId,
      recipientUid: recipient.uid,
      verifiedEmail: recipient.email,
    });
  }

  private async getVerifiedRecipient(user: DecodedIdToken) {
    const account = await this.firebaseService.auth
      .getUser(user.uid)
      .catch((error: unknown) => {
        throw toAuthException(error);
      });

    if (account.disabled) {
      throw new AuthException('AUTH_USER_DISABLED');
    }

    if (!account.emailVerified || !account.email?.trim()) {
      throw new AuthException('AUTH_EMAIL_NOT_VERIFIED');
    }

    return {
      uid: account.uid,
      email: normalizeInvitationEmail(account.email),
    };
  }

  private async deliverInvitation(
    invitation: Invitation,
    token: string,
    context: {
      organizationName: string;
      eventName?: string;
    },
  ): Promise<EmailReceipt['status']> {
    const frontendOrigin = this.config.getOrThrow('FRONTEND_ORIGIN', {
      infer: true,
    });

    const invitationURL = new URL(
      `/invitations/${invitation.id}`,
      frontendOrigin,
    );

    invitationURL.hash = new URLSearchParams({
      token,
    }).toString();

    const isEvent = invitation.scope.type === 'EVENT';

    const targetName = context.eventName ?? context.organizationName;

    try {
      const receipt = await this.emailProvider.send({
        to: invitation.recipientEmail,
        subject: isEvent
          ? 'You have been invited to an event'
          : 'You have been invited to an organization',
        text: [
          `You have been invited to join ${targetName}.`,
          `Organization: ${context.organizationName}`,
          '',
          `Role: ${invitation.role}`,
          `Sign in using: ${invitation.recipientEmail}`,
          '',
          invitationURL.toString(),
          '',
          `This invitation expires at ${invitation.expiresAt.toISOString()}.`,
          '',
          'If you were not expecting this invitation, you can ignore this email.',
        ].join('\n'),
        idempotencyKey: isEvent
          ? `event-invitation/${invitation.id}`
          : `organization-invitation/${invitation.id}`,
      });

      return receipt.status;
    } catch {
      try {
        await this.invitationsRepository.revokeAfterDeliveryFailure({
          invitationId: invitation.id,
          expectedTokenHash: invitation.tokenHash,
          actorUid: invitation.createdByUid,
        });
      } catch (revocationError: unknown) {
        this.logger.error({
          event: 'invitation.email.compensation_failed',
          invitationId: invitation.id,
          ...toDiagnostic(revocationError),
        });
      }

      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        isEvent
          ? 'EVENT_INVITATION_EMAIL_UNCONFIRMED'
          : 'ORGANIZATION_INVITATION_EMAIL_UNCONFIRMED',
        'Invitation email delivery could not be confirmed.',
      );
    }
  }

  async createEvent(scope: EventScope, dto: CreateEventInvitationDto) {
    const { token, tokenHash } = createInvitationToken();

    const now = new Date();

    const ttlHours = this.config.getOrThrow('INVITATION_TTL_HOURS', {
      infer: true,
    });

    const invitation = eventInvitationSchema.parse({
      id: randomUUID(),
      scope: {
        type: 'EVENT',
        organizationId: scope.organizationId,
        eventId: scope.eventId,
      },
      recipientEmail: normalizeInvitationEmail(dto.email),
      role: dto.role,
      tokenHash,
      status: 'PENDING',
      createdByUid: scope.actorUid,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlHours * 60 * 60 * 1000),
      acceptedByUid: null,
      acceptedAt: null,
      revokedAt: null,
    });

    const creation = await this.invitationsRepository.createEvent(
      scope,
      invitation,
    );

    const emailStatus = await this.deliverInvitation(invitation, token, {
      organizationName: creation.organizationName,
      eventName: creation.eventName,
    });

    return {
      id: invitation.id,
      scopeType: 'EVENT' as const,
      organizationId: invitation.scope.organizationId,
      eventId: invitation.scope.eventId,
      recipientEmail: invitation.recipientEmail,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt.toISOString(),
      emailStatus,
    };
  }

  listEventPending(scope: EventScope, cursor?: string) {
    return this.invitationsRepository.listEventPending(scope, cursor);
  }

  revokeEvent(scope: EventScope, invitationId: string): Promise<void> {
    return this.invitationsRepository.revokeEvent(scope, invitationId);
  }
}
