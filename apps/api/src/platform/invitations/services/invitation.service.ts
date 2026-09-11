import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { Auth, UserRecord } from 'firebase-admin/auth';

import { FIREBASE_AUTH } from '@stagegate/backend-platform';

import { parseOrganizationId } from '../../tenancy';
import { InvitationRepository } from '../repositories';
import { AuthenticatedUser, AuthenticationError } from '../../auth';
import {
  parseInvitationInput,
  invitationEmailSchema,
  createInvitationSchema,
  acceptInvitaitionSchema,
  CreateInvitationResponse,
  AcceptedInvitationResponse,
} from '../types';

@Injectable()
export class InvitationService {
  constructor(
    private readonly invitations: InvitationRepository,
    @Inject(FIREBASE_AUTH)
    private readonly auth: Auth,
  ) {}

  async create(
    actor: AuthenticatedUser,
    rawOrganizationId: unknown,
    body: unknown,
    requestId: string,
  ): Promise<CreateInvitationResponse> {
    this.requireVerifiedEmail(actor);

    const organizationId = parseOrganizationId(rawOrganizationId);
    const input = parseInvitationInput(createInvitationSchema, body);

    const token = randomBytes(32).toString('hex');

    const invitationId = this.hashToken(token);

    const result = await this.invitations.create(
      invitationId,
      organizationId,
      actor.uid,
      input,
      requestId,
    );

    return {
      invitationId,
      organizationId,
      email: actor.email!,
      role: input.role,
      expiresAt: result.expiresAt,
      token,
    };
  }

  async accept(
    actor: AuthenticatedUser,
    body: unknown,
    requestId: string,
  ): Promise<AcceptedInvitationResponse> {
    this.requireVerifiedEmail(actor);

    const input = parseInvitationInput(acceptInvitaitionSchema, body);

    const verifiedEmail = await this.currentVerifiedEmail(actor);

    return this.invitations.accept(
      this.hashToken(input.token),
      actor.uid,
      verifiedEmail,
      requestId,
    );
  }

  private requireVerifiedEmail(actor: AuthenticatedUser): void {
    if (actor.email === null || !actor.emailVerified) {
      throw new AuthenticationError('EMAIL_VERIFICATION_REQUIRED');
    }
  }

  private async currentVerifiedEmail(
    actor: AuthenticatedUser,
  ): Promise<string> {
    let user: UserRecord;

    try {
      user = await this.auth.getUser(actor.uid);
    } catch {
      throw new AuthenticationError('AUTH_UNAVAILABLE');
    }

    if (user.disabled) {
      throw new AuthenticationError('AUTH_USER_DISABLED');
    }

    if (!user.emailVerified || user.email === undefined) {
      throw new AuthenticationError('EMAIL_VERIFICATION_REQUIRED');
    }

    const email = invitationEmailSchema.safeParse(user.email);

    if (!email.success) {
      throw new AuthenticationError('EMAIL_VERIFICATION_REQUIRED');
    }

    return email.data;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
