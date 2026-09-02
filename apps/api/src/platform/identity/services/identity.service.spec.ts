import { describe, expect, it, jest } from '@jest/globals';

import type { IdentityError } from '../utils';
import type { AuthenticatedUser } from '../../auth';
import { IdentityService } from './identity.service';
import type { UserProfileRepository } from '../repositories';
import type { BootstrapResult, ProfilePatch, UserProfile } from '../types';

const createdAt = new Date('2026-01-01T00:00:00.000Z');
const updatedAt = new Date('2026-01-02T00:00:00.000Z');

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const profile: UserProfile = {
  userId: 'user-123',
  displayName: 'Ada',
  bio: 'Builds things',
  version: 2,
  createdAt,
  updatedAt,
};

function createRepository(): jest.Mocked<UserProfileRepository> {
  return {
    find: jest.fn<UserProfileRepository['find']>(),
    bootstrap: jest.fn<UserProfileRepository['bootstrap']>(),
    update: jest.fn<UserProfileRepository['update']>(),
  };
}

describe('IdentityService', () => {
  it('bootstraps a profile and maps profile dates to API strings', async () => {
    const repository = createRepository();
    const result: BootstrapResult = {
      created: true,
      profile,
    };

    repository.bootstrap.mockResolvedValue(result);

    const service = new IdentityService(repository);

    await expect(service.bootstrap(actor, 'request-123')).resolves.toEqual({
      created: true,
      profile: {
        userId: 'user-123',
        email: 'person@example.test',
        emailVerified: true,
        displayName: 'Ada',
        bio: 'Builds things',
        version: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    });

    expect(repository.bootstrap).toHaveBeenCalledWith(
      'user-123',
      'request-123',
    );
  });

  it('returns the current actor profile', async () => {
    const repository = createRepository();
    repository.find.mockResolvedValue(profile);

    const service = new IdentityService(repository);

    await expect(service.getProfile(actor)).resolves.toMatchObject({
      userId: 'user-123',
      email: 'person@example.test',
      emailVerified: true,
      displayName: 'Ada',
      bio: 'Builds things',
      version: 2,
    });

    expect(repository.find).toHaveBeenCalledWith('user-123');
  });

  it('throws when the actor has not bootstrapped a profile', async () => {
    const repository = createRepository();
    repository.find.mockResolvedValue(null);

    const service = new IdentityService(repository);

    await expect(service.getProfile(actor)).rejects.toMatchObject({
      code: 'USER_NOT_BOOTSTRAPPED',
    } satisfies Partial<IdentityError>);
  });

  it('updates the current actor profile with the parsed patch', async () => {
    const repository = createRepository();
    const patch: ProfilePatch = {
      expectedVersion: 2,
      displayName: 'Grace',
    };
    const updatedProfile: UserProfile = {
      ...profile,
      displayName: 'Grace',
      version: 3,
      updatedAt: new Date('2026-01-03T00:00:00.000Z'),
    };

    repository.update.mockResolvedValue(updatedProfile);

    const service = new IdentityService(repository);

    await expect(
      service.updateProfile(actor, patch, 'request-456'),
    ).resolves.toMatchObject({
      userId: 'user-123',
      displayName: 'Grace',
      version: 3,
      updatedAt: '2026-01-03T00:00:00.000Z',
    });

    expect(repository.update).toHaveBeenCalledWith(
      'user-123',
      patch,
      'request-456',
    );
  });
});
