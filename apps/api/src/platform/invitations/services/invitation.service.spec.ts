import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import type { Auth, UserRecord } from 'firebase-admin/auth';

import type { AuthenticationError, AuthenticatedUser } from '../../auth';
import { MembershipRole, MembershipStatus } from '../../tenancy';
import type { TenancyError } from '../../tenancy/utils';
import type { AcceptedInvitationResponse } from '../types';
import type { InvitationRepository } from '../repositories';
import { InvitationService } from './invitation.service';

type MockInvitationRepository = jest.Mocked<
  Pick<InvitationRepository, 'accept' | 'create'>
>;
type MockAuth = jest.Mocked<Pick<Auth, 'getUser'>>;

const organizationId = 'abcDEF1234567890wxyz';
const requestId = 'request-123';
const token = 'a'.repeat(64);
const hashedToken = createHash('sha256').update(token).digest('hex');

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'invitee@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const acceptedInvitation: AcceptedInvitationResponse = {
  organizationId,
  membershipId: `${organizationId}_user-123`,
  role: MembershipRole.REVIEWER,
  status: MembershipStatus.ACTIVE,
};

const userRecord = (overrides: Partial<UserRecord> = {}): UserRecord =>
  ({
    uid: actor.uid,
    disabled: false,
    email: actor.email,
    emailVerified: true,
    ...overrides,
  }) as UserRecord;

function createService(): {
  auth: MockAuth;
  invitations: MockInvitationRepository;
  service: InvitationService;
} {
  const invitations: MockInvitationRepository = {
    accept: jest.fn<InvitationRepository['accept']>(),
    create: jest.fn<InvitationRepository['create']>(),
  };
  const auth: MockAuth = {
    getUser: jest.fn<Auth['getUser']>(),
  };

  return {
    auth,
    invitations,
    service: new InvitationService(
      invitations as unknown as InvitationRepository,
      auth as unknown as Auth,
    ),
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('InvitationService', () => {
  it('creates invitations with a hashed generated token', async () => {
    const { invitations, service } = createService();
    invitations.create.mockResolvedValue({
      expiresAt: '2026-01-04T00:00:00.000Z',
    });

    const result = await service.create(
      actor,
      organizationId,
      {
        email: ' Speaker@Example.Test ',
        role: MembershipRole.ADMIN,
      },
      requestId,
    );
    const expectedInvitationId = createHash('sha256')
      .update(result.token)
      .digest('hex');

    expect(result).toEqual({
      invitationId: expectedInvitationId,
      organizationId,
      email: 'invitee@example.test',
      role: MembershipRole.ADMIN,
      expiresAt: '2026-01-04T00:00:00.000Z',
      token: result.token,
    });
    expect(result.token).toMatch(/^[a-f0-9]{64}$/);
    expect(invitations.create).toHaveBeenCalledWith(
      expectedInvitationId,
      organizationId,
      'user-123',
      {
        email: 'speaker@example.test',
        role: MembershipRole.ADMIN,
      },
      requestId,
    );
  });

  it('accepts invitations with a hashed submitted token and current verified email', async () => {
    const { auth, invitations, service } = createService();
    auth.getUser.mockResolvedValue(
      userRecord({ email: ' Invitee@Example.Test ' }),
    );
    invitations.accept.mockResolvedValue(acceptedInvitation);

    await expect(
      service.accept(actor, { token: ` ${token} ` }, requestId),
    ).resolves.toBe(acceptedInvitation);

    expect(auth.getUser).toHaveBeenCalledWith('user-123');
    expect(invitations.accept).toHaveBeenCalledWith(
      hashedToken,
      'user-123',
      'invitee@example.test',
      requestId,
    );
  });

  it.each([
    ['create', { ...actor, emailVerified: false }],
    ['create', { ...actor, email: null }],
    ['accept', { ...actor, emailVerified: false }],
    ['accept', { ...actor, email: null }],
  ] as const)(
    'requires a verified actor email before %s',
    async (operation, currentActor) => {
      const { auth, invitations, service } = createService();

      const action =
        operation === 'create'
          ? service.create(
              currentActor,
              organizationId,
              { email: actor.email, role: MembershipRole.REVIEWER },
              requestId,
            )
          : service.accept(currentActor, { token }, requestId);

      await expect(action).rejects.toMatchObject({
        code: 'EMAIL_VERIFICATION_REQUIRED',
      } satisfies Partial<AuthenticationError>);
      expect(auth.getUser).not.toHaveBeenCalled();
      expect(invitations.create).not.toHaveBeenCalled();
      expect(invitations.accept).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      'invalid organization id',
      'not-an-id',
      { email: actor.email, role: MembershipRole.REVIEWER },
    ],
    [
      'invalid body',
      organizationId,
      { email: 'not-an-email', role: MembershipRole.REVIEWER },
    ],
  ] as const)(
    'rejects create with %s',
    async (_name, rawOrganizationId, body) => {
      const { invitations, service } = createService();

      await expect(
        service.create(actor, rawOrganizationId, body, requestId),
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      } satisfies Partial<TenancyError>);
      expect(invitations.create).not.toHaveBeenCalled();
    },
  );

  it('rejects accept with an invalid token body before reading auth state', async () => {
    const { auth, invitations, service } = createService();

    await expect(
      service.accept(actor, { token: 'short' }, requestId),
    ).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    } satisfies Partial<TenancyError>);
    expect(auth.getUser).not.toHaveBeenCalled();
    expect(invitations.accept).not.toHaveBeenCalled();
  });

  it('maps Firebase lookup failures to auth unavailable', async () => {
    const { auth, invitations, service } = createService();
    auth.getUser.mockRejectedValue(new Error('firebase failed'));

    await expect(
      service.accept(actor, { token }, requestId),
    ).rejects.toMatchObject({
      code: 'AUTH_UNAVAILABLE',
    } satisfies Partial<AuthenticationError>);
    expect(invitations.accept).not.toHaveBeenCalled();
  });

  it('rejects disabled users while accepting invitations', async () => {
    const { auth, invitations, service } = createService();
    auth.getUser.mockResolvedValue(userRecord({ disabled: true }));

    await expect(
      service.accept(actor, { token }, requestId),
    ).rejects.toMatchObject({
      code: 'AUTH_USER_DISABLED',
    } satisfies Partial<AuthenticationError>);
    expect(invitations.accept).not.toHaveBeenCalled();
  });

  it.each([
    ['unverified Firebase email', userRecord({ emailVerified: false })],
    [
      'missing Firebase email',
      { ...userRecord(), email: undefined } as unknown as UserRecord,
    ],
    ['invalid Firebase email', userRecord({ email: 'not-an-email' })],
  ] as const)(
    'requires a current verified Firebase email for %s',
    async (_name, firebaseUser) => {
      const { auth, invitations, service } = createService();
      auth.getUser.mockResolvedValue(firebaseUser);

      await expect(
        service.accept(actor, { token }, requestId),
      ).rejects.toMatchObject({
        code: 'EMAIL_VERIFICATION_REQUIRED',
      } satisfies Partial<AuthenticationError>);
      expect(invitations.accept).not.toHaveBeenCalled();
    },
  );
});
