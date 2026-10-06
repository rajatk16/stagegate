import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ConsoleLogger, HttpStatus, Injectable } from '@nestjs/common';

import { Environment } from '../../config';
import { toAuthException } from '../../auth';
import { toDiagnostic } from '../../observalibility';
import { OrganizationScope } from '../../organizations';
import { InvitationsRepository } from '../repositories';
import { TransactionalEmailProvider } from '../../email';
import { organizationInvitationSchema } from '../models';
import { FirebaseService } from '../../firebase/services';
import { CreateOrganizationInvitationDto } from '../dtos';
import { ApiException, AuthException } from '../../common';
import { createInvitationToken, normalizeInvitationEmail } from '../utils';
import { InvitationAcceptanceResult, InvitationIssueResult } from '../types';

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

    const creation = await this.invitationsRepository.create(invitation);

    try {
      const receipt = await this.emailProvider.send({
        to: invitation.recipientEmail,
        subject: 'You have been invited to an organization',
        text: [
          `You have been invited to join ${creation.organizationName}.`,
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
        idempotencyKey: `organization-invitation/${invitation.id}`,
      });

      return {
        ...creation,
        emailStatus: receipt.status,
      };
    } catch {
      // The provider may have received the email even if our request
      // timed out. Revoke the invitation if it is still pending.
      try {
        await this.invitationsRepository.revokeAfterDeliveryFailure({
          invitationId: invitation.id,
          expectedTokenHash: invitation.tokenHash,
          actorUid: scope.actorUid,
        });
      } catch (revocationError: unknown) {
        // Log only safe diagnostics and the invitation identifier.
        this.logger.error({
          event: 'invitation.email.compensation_failed',
          invitationId: invitation.id,
          ...toDiagnostic(revocationError),
        });
      }

      throw new ApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        'ORGANIZATION_INVITATION_EMAIL_UNCONFIRMED',
        'Invitation email delivery could not be confirmed.',
      );
    }
  }

  async accept(
    user: DecodedIdToken,
    invitationId: string,
    token: string,
  ): Promise<InvitationAcceptanceResult> {
    // Fetch current account data rather than trusting a possibly
    // stale email claim from the ID token.
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

    return this.invitationsRepository.accept({
      invitationId,
      token,
      recipientUid: account.uid,
      verifiedEmail: normalizeInvitationEmail(account.email),
    });
  }
}
