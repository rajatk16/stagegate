import type { Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';

import type { IdentityError } from '../utils';
import type { AuthenticatedUser } from '../../auth';
import { UsersController } from './users.controllers';
import type { IdentityService, ProfileResponse } from '../services';

type MockIdentityService = jest.Mocked<
  Pick<IdentityService, 'bootstrap' | 'getProfile' | 'updateProfile'>
>;

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const profileResponse: ProfileResponse = {
  userId: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  displayName: 'Ada',
  bio: null,
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function createIdentityService(): MockIdentityService {
  return {
    bootstrap: jest.fn<IdentityService['bootstrap']>(),
    getProfile: jest.fn<IdentityService['getProfile']>(),
    updateProfile: jest.fn<IdentityService['updateProfile']>(),
  };
}

function createResponse(): {
  response: Response;
  headers: Record<string, number | string | readonly string[]>;
  status: jest.MockedFunction<Response['status']>;
  setHeader: jest.MockedFunction<Response['setHeader']>;
} {
  const headers: Record<string, number | string | readonly string[]> = {};
  const response = {} as Response;
  const status = jest.fn<Response['status']>().mockReturnValue(response);
  const setHeader = jest.fn<Response['setHeader']>((name, value) => {
    headers[name] = value;
    return response;
  });

  response.status = status;
  response.setHeader = setHeader;

  return { response, headers, status, setHeader };
}

describe('UsersController', () => {
  it('creates a profile, sets response metadata, and returns the profile', async () => {
    const identity = createIdentityService();
    const { headers, response, status } = createResponse();
    const controller = new UsersController(
      identity as unknown as IdentityService,
    );

    identity.bootstrap.mockResolvedValue({
      created: true,
      profile: profileResponse,
    });

    await expect(controller.bootstrap(actor, {}, response)).resolves.toBe(
      profileResponse,
    );

    expect(headers['X-Request-Id']).toEqual(expect.any(String));
    expect(headers['Cache-Control']).toBe('no-store');
    expect(headers['Location']).toBe('/api/v1/users/me');
    expect(status).toHaveBeenCalledWith(201);
    expect(identity.bootstrap).toHaveBeenCalledWith(actor, expect.any(String));
  });

  it('returns an existing profile bootstrap response without a location header', async () => {
    const identity = createIdentityService();
    const { headers, response, status } = createResponse();
    const controller = new UsersController(
      identity as unknown as IdentityService,
    );

    identity.bootstrap.mockResolvedValue({
      created: false,
      profile: profileResponse,
    });

    await expect(controller.bootstrap(actor, {}, response)).resolves.toBe(
      profileResponse,
    );

    expect(status).toHaveBeenCalledWith(200);
    expect(headers['Location']).toBeUndefined();
  });

  it('rejects unsupported bootstrap request bodies before calling the service', async () => {
    const identity = createIdentityService();
    const { response } = createResponse();
    const controller = new UsersController(
      identity as unknown as IdentityService,
    );

    await expect(
      controller.bootstrap(actor, { displayName: 'Ada' }, response),
    ).rejects.toMatchObject({
      code: 'VALIDATION_FAILED',
    } satisfies Partial<IdentityError>);

    expect(identity.bootstrap).not.toHaveBeenCalled();
  });

  it('gets the current profile and sets no-store response headers', async () => {
    const identity = createIdentityService();
    const { headers, response } = createResponse();
    const controller = new UsersController(
      identity as unknown as IdentityService,
    );

    identity.getProfile.mockResolvedValue(profileResponse);

    await expect(controller.getProfile(actor, response)).resolves.toBe(
      profileResponse,
    );

    expect(headers['X-Request-Id']).toEqual(expect.any(String));
    expect(headers['Cache-Control']).toBe('no-store');
    expect(identity.getProfile).toHaveBeenCalledWith(actor);
  });

  it('parses updates and forwards the request id to the service', async () => {
    const identity = createIdentityService();
    const { response } = createResponse();
    const controller = new UsersController(
      identity as unknown as IdentityService,
    );

    identity.updateProfile.mockResolvedValue({
      ...profileResponse,
      displayName: 'Grace',
      version: 2,
    });

    await expect(
      controller.updateProfile(
        actor,
        { expectedVersion: 1, displayName: '  Grace  ' },
        response,
      ),
    ).resolves.toMatchObject({
      displayName: 'Grace',
      version: 2,
    });

    expect(identity.updateProfile).toHaveBeenCalledWith(
      actor,
      {
        expectedVersion: 1,
        displayName: 'Grace',
      },
      expect.any(String),
    );
  });
});
