import { Logger } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';
import type { DocumentSnapshot, Firestore } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

import type { TenancyError } from '../utils';
import { FirestoreMembershipRepository } from './membership.repository';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const storedMembership = (overrides: Record<string, unknown> = {}) => ({
  membershipId: 'org-a_user-123',
  organizationId: 'org-a',
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

const snapshot = (data: Record<string, unknown> | undefined, id = 'org-a_user-123') =>
  ({
    id,
    exists: data !== undefined,
    data: () => data,
  }) as DocumentSnapshot;

function createFirestore(options: {
  documentSnapshot?: DocumentSnapshot;
  querySnapshots?: readonly DocumentSnapshot[];
  collectionError?: Error;
} = {}): {
  firestore: Firestore;
  collection: jest.MockedFunction<(path: string) => unknown>;
  doc: jest.MockedFunction<(id: string) => unknown>;
  where: jest.MockedFunction<(field: string, operator: string, value: string) => unknown>;
} {
  const documentReference = {
    get: jest
      .fn<() => Promise<DocumentSnapshot>>()
      .mockResolvedValue(options.documentSnapshot ?? snapshot(storedMembership())),
  };
  const query = {
    get: jest.fn<() => Promise<{ docs: readonly DocumentSnapshot[] }>>().mockResolvedValue({
      docs: options.querySnapshots ?? [snapshot(storedMembership())],
    }),
  };
  const doc = jest.fn<(id: string) => unknown>().mockReturnValue(documentReference);
  const where = jest.fn<(field: string, operator: string, value: string) => unknown>().mockReturnValue(query);
  const collection = jest.fn<(path: string) => unknown>(() => {
    if (options.collectionError !== undefined) {
      throw options.collectionError;
    }

    return {
      doc,
      where,
    };
  });

  return {
    firestore: {
      collection,
    } as unknown as Firestore,
    collection,
    doc,
    where,
  };
}

describe('FirestoreMembershipRepository', () => {
  it('finds an active membership by composite id', async () => {
    const { doc, firestore } = createFirestore();
    const repository = new FirestoreMembershipRepository(firestore);

    await expect(repository.findActive('org-a', 'user-123')).resolves.toEqual({
      membershipId: 'org-a_user-123',
      organizationId: 'org-a',
      userId: 'user-123',
      role: 'OWNER',
      status: 'ACTIVE',
      version: 1,
      createdAt,
      updatedAt,
    });
    expect(doc).toHaveBeenCalledWith('org-a_user-123');
  });

  it('returns null when an active membership is missing', async () => {
    const { firestore } = createFirestore({
      documentSnapshot: snapshot(undefined),
    });
    const repository = new FirestoreMembershipRepository(firestore);

    await expect(repository.findActive('org-a', 'user-123')).resolves.toBeNull();
  });

  it('lists active memberships for a user', async () => {
    const { firestore, where } = createFirestore({
      querySnapshots: [
        snapshot(storedMembership({ organizationId: 'org-b', membershipId: 'org-b_user-123' }), 'org-b_user-123'),
        snapshot(storedMembership()),
      ],
    });
    const repository = new FirestoreMembershipRepository(firestore);

    await expect(repository.listActiveForUser('user-123')).resolves.toMatchObject([
      {
        organizationId: 'org-b',
      },
      {
        organizationId: 'org-a',
      },
    ]);
    expect(where).toHaveBeenCalledWith('userId', '==', 'user-123');
  });

  it('throws when membership data is invalid', async () => {
    const { firestore } = createFirestore({
      documentSnapshot: snapshot(storedMembership({ membershipId: 'wrong-id' })),
    });
    const repository = new FirestoreMembershipRepository(firestore);

    await expect(repository.findActive('org-a', 'user-123')).rejects.toMatchObject({
      code: 'TENANCY_DATA_INVALID',
    } satisfies Partial<TenancyError>);
  });

  it('wraps unexpected storage failures', async () => {
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { firestore } = createFirestore({
      collectionError: new Error('permission denied'),
    });
    const repository = new FirestoreMembershipRepository(firestore);

    await expect(repository.findActive('org-a', 'user-123')).rejects.toMatchObject({
      code: 'TENANCY_UNAVAILABLE',
    } satisfies Partial<TenancyError>);
    expect(loggerError).toHaveBeenCalledWith('Membership persistence failed.');
  });
});
