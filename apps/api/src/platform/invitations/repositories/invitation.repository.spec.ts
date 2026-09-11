import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Logger } from '@nestjs/common';
import type {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  Transaction,
} from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

import {
  MembershipRole,
  MembershipStatus,
  type OrganizationPolicyService,
} from '../../tenancy';
import { TenancyError } from '../../tenancy/utils';
import { INIVITATION_LIFETIME_MS, type CreateInvitationInput } from '../types';
import { InvitationRepository } from './invitation.repository';

type TestReference = DocumentReference & { readonly path: string };

const organizationId = 'abcDEF1234567890wxyz';
const invitationId = 'b'.repeat(64);
const actorId = 'user-123';
const inviterId = 'owner-123';
const requestId = 'request-123';
const now = Date.parse('2026-01-01T00:00:00.000Z');
const createdAt = new Date('2025-12-31T00:00:00.000Z');
const updatedAt = new Date('2026-01-01T00:00:00.000Z');

const input: CreateInvitationInput = {
  email: 'invitee@example.test',
  role: MembershipRole.REVIEWER,
};

const reference = (collection: string, id: string): TestReference =>
  ({ id, path: `${collection}/${id}` }) as TestReference;

const snapshot = (
  data: Record<string, unknown> | undefined,
  id: string,
): DocumentSnapshot =>
  ({
    id,
    exists: data !== undefined,
    data: () => data,
    get: (field: string) => data?.[field],
  }) as DocumentSnapshot;

const storedMembership = (overrides: Record<string, unknown> = {}) => ({
  membershipId: `${organizationId}_${inviterId}`,
  organizationId,
  userId: inviterId,
  role: MembershipRole.OWNER,
  status: MembershipStatus.ACTIVE,
  version: 1,
  schemaVersion: 1,
  createdAt: Timestamp.fromDate(createdAt),
  updatedAt: Timestamp.fromDate(updatedAt),
  createdBy: inviterId,
  updatedBy: inviterId,
  ...overrides,
});

const storedInvitation = (overrides: Record<string, unknown> = {}) => ({
  invitationId,
  organizationId,
  email: 'invitee@example.test',
  role: MembershipRole.REVIEWER,
  status: 'PENDING',
  expiresAt: Timestamp.fromMillis(now + INIVITATION_LIFETIME_MS),
  acceptedAt: null,
  acceptedBy: null,
  schemaVersion: 1,
  createdAt: Timestamp.fromDate(createdAt),
  updatedAt: Timestamp.fromDate(updatedAt),
  createdBy: inviterId,
  updatedBy: inviterId,
  ...overrides,
});

function createPolicy(): jest.Mocked<
  Pick<OrganizationPolicyService, 'assertCanInvite'>
> {
  return {
    assertCanInvite: jest.fn<OrganizationPolicyService['assertCanInvite']>(
      (membership) => {
        if (membership === null) {
          throw new TenancyError('ORGANIZATION_NOT_FOUND');
        }

        return membership;
      },
    ),
  };
}

function createFirestore(
  snapshots: Record<string, DocumentSnapshot> = {},
  options: { readonly collectionError?: Error } = {},
): {
  firestore: Firestore;
  transaction: {
    get: jest.MockedFunction<
      (document: DocumentReference) => Promise<DocumentSnapshot>
    >;
    create: jest.MockedFunction<
      (document: DocumentReference, data: unknown) => Transaction
    >;
    update: jest.MockedFunction<
      (document: DocumentReference, data: unknown) => Transaction
    >;
  };
} {
  const transaction = {
    get: jest.fn<(document: DocumentReference) => Promise<DocumentSnapshot>>(
      (document) => {
        const path = (document as TestReference).path;
        return Promise.resolve(
          snapshots[path] ?? snapshot(undefined, document.id),
        );
      },
    ),
    create: jest
      .fn<(document: DocumentReference, data: unknown) => Transaction>()
      .mockReturnValue({} as Transaction),
    update: jest
      .fn<(document: DocumentReference, data: unknown) => Transaction>()
      .mockReturnValue({} as Transaction),
  };
  const collection = jest.fn((name: string) => {
    if (options.collectionError !== undefined) {
      throw options.collectionError;
    }

    return {
      doc: (id?: string) => reference(name, id ?? `${name}-auto-id`),
    };
  });

  return {
    firestore: {
      collection,
      runTransaction: async <T>(
        operation: (transaction: Transaction) => Promise<T>,
      ) => operation(transaction as unknown as Transaction),
    } as unknown as Firestore,
    transaction,
  };
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe('InvitationRepository', () => {
  it('creates a pending invitation and audit record', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore, transaction } = createFirestore({
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${actorId}`]: snapshot(
        storedMembership({
          membershipId: `${organizationId}_${actorId}`,
          userId: actorId,
        }),
        `${organizationId}_${actorId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.create(
        invitationId,
        organizationId,
        actorId,
        input,
        requestId,
      ),
    ).resolves.toEqual({
      expiresAt: new Date(now + INIVITATION_LIFETIME_MS).toISOString(),
    });

    expect(policy.assertCanInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        membershipId: `${organizationId}_${actorId}`,
      }),
      actorId,
      organizationId,
      MembershipRole.REVIEWER,
    );
    expect(transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ path: `invitations/${invitationId}` }),
      expect.objectContaining({
        invitationId,
        organizationId,
        email: 'invitee@example.test',
        role: MembershipRole.REVIEWER,
        status: 'PENDING',
        acceptedAt: null,
        acceptedBy: null,
        createdBy: actorId,
      }),
    );
    expect(transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'auditLogs/auditLogs-auto-id' }),
      expect.objectContaining({
        action: 'invitation.created',
        requestId,
      }),
    );
  });

  it('rejects create when the organization is missing', async () => {
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`memberships/${organizationId}_${actorId}`]: snapshot(
        storedMembership({
          membershipId: `${organizationId}_${actorId}`,
          userId: actorId,
        }),
        `${organizationId}_${actorId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.create(
        invitationId,
        organizationId,
        actorId,
        input,
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'ORGANIZATION_NOT_FOUND',
    } satisfies Partial<TenancyError>);
  });

  it('rejects create when organization data does not match its document id', async () => {
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`organizations/${organizationId}`]: snapshot(
        { organizationId: 'differentOrganization' },
        organizationId,
      ),
      [`memberships/${organizationId}_${actorId}`]: snapshot(
        storedMembership({
          membershipId: `${organizationId}_${actorId}`,
          userId: actorId,
        }),
        `${organizationId}_${actorId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.create(
        invitationId,
        organizationId,
        actorId,
        input,
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });

  it('rejects unsafe actor ids before creating an invitation', async () => {
    const policy = createPolicy();
    const { firestore, transaction } = createFirestore();
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.create(
        invitationId,
        organizationId,
        'users/user-123',
        input,
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
    expect(transaction.create).not.toHaveBeenCalled();
  });

  it('accepts a pending invitation and creates the recipient membership', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore, transaction } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        storedMembership(),
        `${organizationId}_${inviterId}`,
      ),
      [`users/${actorId}`]: snapshot({}, actorId),
      [`memberships/${organizationId}_${actorId}`]: snapshot(
        undefined,
        `${organizationId}_${actorId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).resolves.toEqual({
      organizationId,
      membershipId: `${organizationId}_${actorId}`,
      role: MembershipRole.REVIEWER,
      status: MembershipStatus.ACTIVE,
    });

    expect(transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        path: `memberships/${organizationId}_${actorId}`,
      }),
      expect.objectContaining({
        membershipId: `${organizationId}_${actorId}`,
        organizationId,
        userId: actorId,
        role: MembershipRole.REVIEWER,
        status: MembershipStatus.ACTIVE,
      }),
    );
    expect(transaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ path: `invitations/${invitationId}` }),
      expect.objectContaining({
        status: 'ACCEPTED',
        acceptedBy: actorId,
        updatedBy: actorId,
      }),
    );
    expect(transaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ path: 'auditLogs/auditLogs-auto-id' }),
      expect.objectContaining({
        action: 'invitation.accepted',
        requestId,
      }),
    );
  });

  it.each([
    ['missing invitation', undefined, 'INVITATION_UNAVAILABLE'],
    [
      'already accepted invitation',
      storedInvitation({
        status: 'ACCEPTED',
        acceptedAt: Timestamp.fromMillis(now),
        acceptedBy: actorId,
      }),
      'INVITATION_UNAVAILABLE',
    ],
    [
      'expired invitation',
      storedInvitation({ expiresAt: Timestamp.fromMillis(now - 1) }),
      'INVITATION_UNAVAILABLE',
    ],
    [
      'invalid invitation data',
      storedInvitation({ invitationId: 'wrong' }),
      'TENANCY_DATA_INVALID',
    ],
  ] as const)('rejects accept for %s', async (_name, invitation, code) => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(invitation, invitationId),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code,
    });
  });

  it('rejects accept when the verified email differs from the invitation email', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(invitationId, actorId, 'other@example.test', requestId),
    ).rejects.toMatchObject({
      code: 'INVITATION_EMAIL_MISMATCH',
    } satisfies Partial<TenancyError>);
  });

  it('rejects accept when the organization is no longer available', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(undefined, organizationId),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'INVITATION_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
  });

  it('rejects accept when organization data no longer matches its document id', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId: 'differentOrganization' },
        organizationId,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });

  it('hides inviter authorization failures while accepting invitations', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    policy.assertCanInvite.mockImplementation(() => {
      throw new TenancyError('PERMISSION_DENIED');
    });
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        storedMembership(),
        `${organizationId}_${inviterId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'INVITATION_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
  });

  it('hides invitations when the inviter membership is missing', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        undefined,
        `${organizationId}_${inviterId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'INVITATION_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
  });

  it('rethrows invalid inviter membership data while accepting invitations', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        storedMembership({ membershipId: 'wrong-id' }),
        `${organizationId}_${inviterId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });

  it('requires an accepted invitee to have a bootstrapped profile', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        storedMembership(),
        `${organizationId}_${inviterId}`,
      ),
      [`users/${actorId}`]: snapshot(undefined, actorId),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'ACTOR_NOT_BOOTSTRAPPED',
    } satisfies Partial<TenancyError>);
  });

  it('rejects invitations that expire before the membership write', async () => {
    jest
      .spyOn(Date, 'now')
      .mockReturnValueOnce(now)
      .mockReturnValueOnce(now + INIVITATION_LIFETIME_MS + 1);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        storedMembership(),
        `${organizationId}_${inviterId}`,
      ),
      [`users/${actorId}`]: snapshot({}, actorId),
      [`memberships/${organizationId}_${actorId}`]: snapshot(
        undefined,
        `${organizationId}_${actorId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'INVITATION_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
  });

  it('rejects accepting an invitation when the recipient membership already exists', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const policy = createPolicy();
    const { firestore } = createFirestore({
      [`invitations/${invitationId}`]: snapshot(
        storedInvitation(),
        invitationId,
      ),
      [`organizations/${organizationId}`]: snapshot(
        { organizationId },
        organizationId,
      ),
      [`memberships/${organizationId}_${inviterId}`]: snapshot(
        storedMembership(),
        `${organizationId}_${inviterId}`,
      ),
      [`users/${actorId}`]: snapshot({}, actorId),
      [`memberships/${organizationId}_${actorId}`]: snapshot(
        storedMembership({
          membershipId: `${organizationId}_${actorId}`,
          userId: actorId,
        }),
        `${organizationId}_${actorId}`,
      ),
    });
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'MEMBERSHIP_ALREADY_EXISTS',
    } satisfies Partial<TenancyError>);
  });

  it('wraps unexpected storage failures', async () => {
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const policy = createPolicy();
    const { firestore } = createFirestore(
      {},
      { collectionError: new Error('unavailable') },
    );
    const repository = new InvitationRepository(
      firestore,
      policy as unknown as OrganizationPolicyService,
    );

    await expect(
      repository.accept(
        invitationId,
        actorId,
        'invitee@example.test',
        requestId,
      ),
    ).rejects.toMatchObject({
      code: 'TENANCY_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
    expect(loggerError).toHaveBeenCalledWith('Invitation persistence failed.');
  });
});
