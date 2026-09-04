import { Logger } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import type { DocumentReference, DocumentSnapshot, Firestore, Transaction } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

import type { TenancyError } from '../utils';
import { FirestoreOrganizationRepository } from './organization.repository';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const storedOrganization = (overrides: Record<string, unknown> = {}) => ({
  organizationId: 'abcDEF1234567890wxyz',
  name: 'StageGate Conf',
  version: 1,
  schemaVersion: 1,
  createdAt: Timestamp.fromDate(createdAt),
  updatedAt: Timestamp.fromDate(updatedAt),
  createdBy: 'user-123',
  updatedBy: 'user-123',
  ...overrides,
});

const storedMembership = (overrides: Record<string, unknown> = {}) => ({
  membershipId: 'abcDEF1234567890wxyz_user-123',
  organizationId: 'abcDEF1234567890wxyz',
  userId: 'user-123',
  role: 'OWNER',
  status: 'ACTIVE',
  version: 1,
  schemaVersion: 1,
  createdAt: Timestamp.fromDate(createdAt),
  updatedAt: Timestamp.fromDate(updatedAt),
  createdBy: 'user-123',
  updatedBy: 'user-123',
  ...overrides,
});

const snapshot = (
  data: Record<string, unknown> | undefined,
  id = 'abcDEF1234567890wxyz',
): DocumentSnapshot =>
  ({
    id,
    exists: data !== undefined,
    data: () => data,
  }) as DocumentSnapshot;

function createFirestore(options: {
  userExists?: boolean;
  organizationSnapshot?: DocumentSnapshot;
  membershipSnapshot?: DocumentSnapshot;
  getAllSnapshots?: readonly DocumentSnapshot[];
  collectionError?: Error;
} = {}): {
  firestore: Firestore;
  organizationReference: DocumentReference;
  membershipReference: DocumentReference;
  transaction: {
    get: jest.MockedFunction<(reference: DocumentReference) => Promise<DocumentSnapshot>>;
    set: jest.MockedFunction<(reference: DocumentReference, data: unknown) => Transaction>;
  };
  getAll: jest.MockedFunction<(...references: DocumentReference[]) => Promise<DocumentSnapshot[]>>;
} {
  const userReference = { id: 'user-123' } as DocumentReference;
  const organizationReference = {
    id: 'abcDEF1234567890wxyz',
    get: jest
      .fn<() => Promise<DocumentSnapshot>>()
      .mockResolvedValue(options.organizationSnapshot ?? snapshot(storedOrganization())),
  } as unknown as DocumentReference;
  const membershipReference = {
    id: 'abcDEF1234567890wxyz_user-123',
    get: jest
      .fn<() => Promise<DocumentSnapshot>>()
      .mockResolvedValue(
        options.membershipSnapshot ??
          snapshot(storedMembership(), 'abcDEF1234567890wxyz_user-123'),
      ),
  } as unknown as DocumentReference;
  const auditReference = { id: 'audit-123' } as DocumentReference;

  const usersCollection = {
    doc: jest.fn<(id: string) => DocumentReference>().mockReturnValue(userReference),
  };
  const organizationsCollection = {
    doc: jest.fn<(id?: string) => DocumentReference>().mockImplementation((id) =>
      id === undefined
        ? organizationReference
        : ({
            id,
            get: jest
              .fn<() => Promise<DocumentSnapshot>>()
              .mockResolvedValue(options.organizationSnapshot ?? snapshot(storedOrganization(), id)),
          } as unknown as DocumentReference),
    ),
  };
  const membershipsCollection = {
    doc: jest.fn<(id: string) => DocumentReference>().mockReturnValue(membershipReference),
  };
  const auditCollection = {
    doc: jest.fn<() => DocumentReference>().mockReturnValue(auditReference),
  };
  const collection = jest.fn((path: string) => {
    if (options.collectionError !== undefined) {
      throw options.collectionError;
    }

    if (path === 'users') return usersCollection;
    if (path === 'organizations') return organizationsCollection;
    if (path === 'memberships') return membershipsCollection;
    if (path === 'auditLogs') return auditCollection;

    throw new Error(`Unexpected collection: ${path}`);
  });
  const transaction = {
    get: jest
      .fn<(reference: DocumentReference) => Promise<DocumentSnapshot>>()
      .mockResolvedValue(snapshot(options.userExists === false ? undefined : {}, 'user-123')),
    set: jest
      .fn<(reference: DocumentReference, data: unknown) => Transaction>()
      .mockReturnValue({} as Transaction),
  };
  const runTransaction = jest.fn(
    async (operation: (transaction: Transaction) => Promise<void>) =>
      operation(transaction as unknown as Transaction),
  );
  const getAll = jest
    .fn<(...references: DocumentReference[]) => Promise<DocumentSnapshot[]>>()
    .mockResolvedValue([...(options.getAllSnapshots ?? [snapshot(storedOrganization())])]);

  return {
    firestore: {
      collection,
      runTransaction,
      getAll,
    } as unknown as Firestore,
    organizationReference,
    membershipReference,
    transaction,
    getAll,
  };
}

describe('FirestoreOrganizationRepository', () => {
  it('creates an organization with owner membership and audit record', async () => {
    const { firestore, membershipReference, organizationReference, transaction } = createFirestore();
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(
      repository.createWithOwner('StageGate Conf', 'user-123', 'request-123'),
    ).resolves.toMatchObject({
      organization: {
        organizationId: 'abcDEF1234567890wxyz',
        name: 'StageGate Conf',
      },
      membership: {
        membershipId: 'abcDEF1234567890wxyz_user-123',
        role: 'OWNER',
      },
    });

    expect(transaction.set).toHaveBeenCalledWith(
      organizationReference,
      expect.objectContaining({
        organizationId: 'abcDEF1234567890wxyz',
        name: 'StageGate Conf',
        createdBy: 'user-123',
      }),
    );
    expect(transaction.set).toHaveBeenCalledWith(
      membershipReference,
      expect.objectContaining({
        membershipId: 'abcDEF1234567890wxyz_user-123',
        organizationId: 'abcDEF1234567890wxyz',
        userId: 'user-123',
        role: 'OWNER',
        status: 'ACTIVE',
      }),
    );
    expect(transaction.set).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        action: 'organization.created',
        requestId: 'request-123',
      }),
    );
  });

  it('requires the actor to be bootstrapped before creating an organization', async () => {
    const { firestore } = createFirestore({ userExists: false });
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(
      repository.createWithOwner('StageGate Conf', 'user-123', 'request-123'),
    ).rejects.toMatchObject({
      code: 'ACTOR_NOT_BOOTSTRAPPED',
    } satisfies Partial<TenancyError>);
  });

  it('rejects unsafe actor ids before writing Firestore documents', async () => {
    const { firestore, transaction } = createFirestore();
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(
      repository.createWithOwner('StageGate Conf', 'users/user-123', 'request-123'),
    ).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
    expect(transaction.set).not.toHaveBeenCalled();
  });

  it('finds an organization by id', async () => {
    const { firestore } = createFirestore();
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(repository.find('abcDEF1234567890wxyz')).resolves.toEqual({
      organizationId: 'abcDEF1234567890wxyz',
      name: 'StageGate Conf',
      version: 1,
      createdAt,
      updatedAt,
    });
  });

  it('returns null when an organization is missing', async () => {
    const { firestore } = createFirestore({
      organizationSnapshot: snapshot(undefined),
    });
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(repository.find('abcDEF1234567890wxyz')).resolves.toBeNull();
  });

  it('returns an empty array without reading Firestore for an empty batch lookup', async () => {
    const { firestore, getAll } = createFirestore();
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(repository.findMany([])).resolves.toEqual([]);
    expect(getAll).not.toHaveBeenCalled();
  });

  it('finds many organizations by id', async () => {
    const { firestore, getAll } = createFirestore({
      getAllSnapshots: [
        snapshot(storedOrganization({ organizationId: 'org-a', name: 'Alpha' }), 'org-a'),
        snapshot(storedOrganization({ organizationId: 'org-b', name: 'Beta' }), 'org-b'),
      ],
    });
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(repository.findMany(['org-a', 'org-b'])).resolves.toMatchObject([
      {
        organizationId: 'org-a',
        name: 'Alpha',
      },
      {
        organizationId: 'org-b',
        name: 'Beta',
      },
    ]);
    expect(getAll).toHaveBeenCalledTimes(1);
  });

  it('throws when batch lookup returns a missing organization', async () => {
    const { firestore } = createFirestore({
      getAllSnapshots: [snapshot(undefined, 'org-a')],
    });
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(repository.findMany(['org-a'])).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });

  it('wraps unexpected storage failures', async () => {
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { firestore } = createFirestore({
      collectionError: new Error('permission denied'),
    });
    const repository = new FirestoreOrganizationRepository(firestore);

    await expect(repository.find('abcDEF1234567890wxyz')).rejects.toMatchObject({
      code: 'TENANCY_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
    expect(loggerError).toHaveBeenCalledWith('Organization persistence failed.');
  });
});
