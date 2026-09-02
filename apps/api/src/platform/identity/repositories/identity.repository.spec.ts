import { Logger } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';
import { describe, expect, it, jest } from '@jest/globals';
import type {
  Firestore,
  Transaction,
  DocumentSnapshot,
  DocumentReference,
} from 'firebase-admin/firestore';

import type { IdentityError } from '../utils';
import { IdentityRepository } from './identity.repository';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

function storedProfile(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    userId: 'user-123',
    displayName: 'Ada',
    bio: 'Builds things',
    version: 2,
    schemaVersion: 1,
    createdAt: Timestamp.fromDate(createdAt),
    updatedAt: Timestamp.fromDate(updatedAt),
    createdBy: 'user-123',
    updatedBy: 'user-123',
    ...overrides,
  };
}

function createSnapshot(
  data: Record<string, unknown> | undefined,
  id = 'user-123',
): DocumentSnapshot {
  return {
    id,
    exists: data !== undefined,
    data: () => data,
  } as DocumentSnapshot;
}

function createFirestore(
  options: {
    readSnapshot?: DocumentSnapshot;
    transactionSnapshot?: DocumentSnapshot;
    collectionError?: Error;
  } = {},
): {
  firestore: Firestore;
  profileReference: DocumentReference;
  auditReference: DocumentReference;
  transaction: {
    create: jest.MockedFunction<
      (reference: DocumentReference, data: unknown) => Transaction
    >;
    get: jest.MockedFunction<
      (reference: DocumentReference) => Promise<DocumentSnapshot>
    >;
    update: jest.MockedFunction<
      (reference: DocumentReference, data: unknown) => Transaction
    >;
  };
  collection: jest.MockedFunction<
    (path: string) => { doc: (id?: string) => DocumentReference }
  >;
  runTransaction: jest.MockedFunction<
    (
      updateFunction: (transaction: Transaction) => Promise<unknown>,
    ) => Promise<unknown>
  >;
} {
  const profileReference = {
    get: jest
      .fn<() => Promise<DocumentSnapshot>>()
      .mockResolvedValue(
        options.readSnapshot ?? createSnapshot(storedProfile()),
      ),
  } as unknown as DocumentReference;
  const auditReference = {} as DocumentReference;
  const transaction = {
    create: jest
      .fn<(reference: DocumentReference, data: unknown) => Transaction>()
      .mockReturnValue({} as Transaction),
    get: jest
      .fn<(reference: DocumentReference) => Promise<DocumentSnapshot>>()
      .mockResolvedValue(
        options.transactionSnapshot ?? createSnapshot(undefined),
      ),
    update: jest
      .fn<(reference: DocumentReference, data: unknown) => Transaction>()
      .mockReturnValue({} as Transaction),
  };
  const usersCollection = {
    doc: jest
      .fn<(id?: string) => DocumentReference>()
      .mockReturnValue(profileReference),
  };
  const auditCollection = {
    doc: jest
      .fn<(id?: string) => DocumentReference>()
      .mockReturnValue(auditReference),
  };
  const collection = jest.fn((path: string) => {
    if (options.collectionError !== undefined) {
      throw options.collectionError;
    }

    if (path === 'users') {
      return usersCollection;
    }

    if (path === 'auditLogs') {
      return auditCollection;
    }

    throw new Error(`Unexpected collection: ${path}`);
  });
  const runTransaction = jest.fn(
    async (updateFunction: (transaction: Transaction) => Promise<unknown>) =>
      updateFunction(transaction as unknown as Transaction),
  );
  const firestore = {
    collection,
    runTransaction,
  } as unknown as Firestore;

  return {
    firestore,
    profileReference,
    auditReference,
    transaction,
    collection,
    runTransaction,
  };
}

describe('IdentityRepository', () => {
  it('returns a decoded profile when it exists', async () => {
    const { firestore } = createFirestore();
    const repository = new IdentityRepository(firestore);

    await expect(repository.find('user-123')).resolves.toEqual({
      userId: 'user-123',
      displayName: 'Ada',
      bio: 'Builds things',
      version: 2,
      createdAt,
      updatedAt,
    });
  });

  it('returns null when a profile does not exist', async () => {
    const { firestore } = createFirestore({
      readSnapshot: createSnapshot(undefined),
    });
    const repository = new IdentityRepository(firestore);

    await expect(repository.find('user-123')).resolves.toBeNull();
  });

  it.each(['', 'users/user-123', '.', '..', '__system__'])(
    'rejects unsafe user ids before reading Firestore: %p',
    async (userId) => {
      const { collection, firestore } = createFirestore();
      const repository = new IdentityRepository(firestore);

      await expect(repository.find(userId)).rejects.toMatchObject({
        code: 'PROFILE_DATA_INVALID',
      } satisfies Partial<IdentityError>);

      expect(collection).not.toHaveBeenCalled();
    },
  );

  it('wraps unexpected storage errors without leaking details', async () => {
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const { firestore } = createFirestore({
      collectionError: new Error('permission denied for users/user-123'),
    });
    const repository = new IdentityRepository(firestore);

    await expect(repository.find('user-123')).rejects.toMatchObject({
      code: 'PROFILE_UNAVAILABLE',
    } satisfies Partial<IdentityError>);

    expect(loggerError).toHaveBeenCalledWith(
      'User profile persistence failed.',
    );
  });

  it('creates the profile and audit log when bootstrapping a new user', async () => {
    const { auditReference, firestore, profileReference, transaction } =
      createFirestore();
    const repository = new IdentityRepository(firestore);

    await expect(
      repository.bootstrap('user-123', 'request-123'),
    ).resolves.toMatchObject({
      created: true,
      profile: {
        userId: 'user-123',
        version: 2,
      },
    });

    expect(transaction.create).toHaveBeenCalledWith(
      profileReference,
      expect.objectContaining({
        userId: 'user-123',
        displayName: null,
        bio: null,
        version: 1,
        schemaVersion: 1,
        createdBy: 'user-123',
        updatedBy: 'user-123',
      }),
    );
    expect(transaction.create).toHaveBeenCalledWith(
      auditReference,
      expect.objectContaining({
        actorId: 'user-123',
        action: 'user.bootstrapped',
        resourceType: 'user',
        resourceId: 'user-123',
        requestId: 'request-123',
      }),
    );
  });

  it('does not create duplicate records when bootstrapping an existing user', async () => {
    const { firestore, transaction } = createFirestore({
      transactionSnapshot: createSnapshot(storedProfile()),
    });
    const repository = new IdentityRepository(firestore);

    await expect(
      repository.bootstrap('user-123', 'request-123'),
    ).resolves.toMatchObject({
      created: false,
      profile: {
        userId: 'user-123',
      },
    });

    expect(transaction.create).not.toHaveBeenCalled();
  });

  it('updates changed fields and writes an audit log', async () => {
    const { auditReference, firestore, profileReference, transaction } =
      createFirestore({
        transactionSnapshot: createSnapshot(storedProfile()),
      });
    const repository = new IdentityRepository(firestore);

    await expect(
      repository.update(
        'user-123',
        {
          expectedVersion: 2,
          displayName: 'Grace',
          bio: 'Builds safer systems',
        },
        'request-456',
      ),
    ).resolves.toMatchObject({
      userId: 'user-123',
      version: 2,
    });

    expect(transaction.update).toHaveBeenCalledWith(
      profileReference,
      expect.objectContaining({
        displayName: 'Grace',
        bio: 'Builds safer systems',
        version: 3,
        updatedBy: 'user-123',
      }),
    );
    expect(transaction.create).toHaveBeenCalledWith(
      auditReference,
      expect.objectContaining({
        action: 'user.profile.updated',
        requestId: 'request-456',
        summary: {
          version: 3,
          changedFields: ['displayName', 'bio'],
        },
      }),
    );
  });

  it('rejects stale profile updates', async () => {
    const { firestore, transaction } = createFirestore({
      transactionSnapshot: createSnapshot(storedProfile()),
    });
    const repository = new IdentityRepository(firestore);

    await expect(
      repository.update(
        'user-123',
        { expectedVersion: 1, displayName: 'Grace' },
        'request-456',
      ),
    ).rejects.toMatchObject({
      code: 'CONCURRENCY_CONFLICT',
    } satisfies Partial<IdentityError>);

    expect(transaction.update).not.toHaveBeenCalled();
    expect(transaction.create).not.toHaveBeenCalled();
  });
});
