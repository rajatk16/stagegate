import type { Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';

import type { AuthenticatedUser } from '../../auth';
import type { OrganizationResponse } from '../types';
import type { OrganizationService } from '../services';
import type { TenancyError } from '../utils';
import { OrganizationsControllers } from './organizations.controllers';

type MockOrganizationService = jest.Mocked<Pick<OrganizationService, 'create' | 'get' | 'list'>>;
type StoredHeaderValue = number | string | string[];

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const organizationResponse: OrganizationResponse = {
  organizationId: 'abcDEF1234567890wxyz',
  name: 'StageGate Conf',
  version: 1,
  membership: {
    membershipId: 'abcDEF1234567890wxyz_user-123',
    role: 'OWNER',
    status: 'ACTIVE',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

function createOrganizationService(): MockOrganizationService {
  return {
    create: jest.fn<OrganizationService['create']>(),
    get: jest.fn<OrganizationService['get']>(),
    list: jest.fn<OrganizationService['list']>(),
  };
}

function createResponse(existingRequestId?: string): {
  response: Response;
  headers: Record<string, StoredHeaderValue>;
  status: jest.MockedFunction<Response['status']>;
} {
  const headers: Record<string, StoredHeaderValue> =
    existingRequestId === undefined ? {} : { 'X-Request-Id': existingRequestId };
  const response = {} as Response;
  const getHeader = jest.fn<Response['getHeader']>((name) => headers[String(name)]);
  const setHeader = jest.fn<Response['setHeader']>((name, value) => {
    headers[name] = typeof value === 'string' || typeof value === 'number' ? value : [...value];
    return response;
  });
  const status = jest.fn<Response['status']>().mockReturnValue(response);

  response.getHeader = getHeader;
  response.setHeader = setHeader;
  response.status = status;

  return { response, headers, status };
}

describe('OrganizationsControllers', () => {
  it('creates an organization and writes response metadata', async () => {
    const organizations = createOrganizationService();
    const { headers, response, status } = createResponse('request-123');
    const controller = new OrganizationsControllers(
      organizations as unknown as OrganizationService,
    );

    organizations.create.mockResolvedValue(organizationResponse);

    await expect(controller.create(actor, { name: '  StageGate Conf  ' }, response)).resolves.toBe(
      organizationResponse,
    );

    expect(organizations.create).toHaveBeenCalledWith(actor, 'StageGate Conf', 'request-123');
    expect(status).toHaveBeenCalledWith(201);
    expect(headers['Location']).toBe('/api/v1/organizations/abcDEF1234567890wxyz');
    expect(headers['Cache-Control']).toBe('no-store');
  });

  it('rejects invalid create input before calling the service', async () => {
    const organizations = createOrganizationService();
    const { response } = createResponse();
    const controller = new OrganizationsControllers(
      organizations as unknown as OrganizationService,
    );

    await expect(controller.create(actor, { name: 'A' }, response)).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
    } satisfies Partial<TenancyError>);
    expect(organizations.create).not.toHaveBeenCalled();
  });

  it('lists the actor organizations', async () => {
    const organizations = createOrganizationService();
    const { headers, response } = createResponse();
    const controller = new OrganizationsControllers(
      organizations as unknown as OrganizationService,
    );

    organizations.list.mockResolvedValue([organizationResponse]);

    await expect(controller.list(actor, response)).resolves.toEqual([organizationResponse]);
    expect(organizations.list).toHaveBeenCalledWith(actor);
    expect(headers['X-Request-Id']).toEqual(expect.any(String));
  });

  it('gets an organization after parsing the route parameter', async () => {
    const organizations = createOrganizationService();
    const { response } = createResponse();
    const controller = new OrganizationsControllers(
      organizations as unknown as OrganizationService,
    );

    organizations.get.mockResolvedValue(organizationResponse);

    await expect(controller.get(actor, 'abcDEF1234567890wxyz', response)).resolves.toBe(
      organizationResponse,
    );
    expect(organizations.get).toHaveBeenCalledWith(actor, 'abcDEF1234567890wxyz');
  });
});
