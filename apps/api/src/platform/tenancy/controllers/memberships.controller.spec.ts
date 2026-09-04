import type { Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';

import type { AuthenticatedUser } from '../../auth';
import type { MembershipResponse } from '../types';
import type { MembershipService } from '../services';
import { MembershipsController } from './memberships.controller';

type MockMembershipService = jest.Mocked<Pick<MembershipService, 'listMine'>>;
type StoredHeaderValue = number | string | string[];

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'person@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const membershipResponse: MembershipResponse = {
  membershipId: 'org-a_user-123',
  organizationId: 'org-a',
  userId: 'user-123',
  role: 'OWNER',
  status: 'ACTIVE',
  version: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

function createResponse(existingRequestId?: string): {
  response: Response;
  headers: Record<string, StoredHeaderValue>;
} {
  const headers: Record<string, StoredHeaderValue> =
    existingRequestId === undefined ? {} : { 'X-Request-Id': existingRequestId };
  const response = {} as Response;
  const getHeader = jest.fn<Response['getHeader']>((name) => headers[String(name)]);
  const setHeader = jest.fn<Response['setHeader']>((name, value) => {
    headers[name] = typeof value === 'string' || typeof value === 'number' ? value : [...value];
    return response;
  });

  response.getHeader = getHeader;
  response.setHeader = setHeader;

  return { response, headers };
}

describe('MembershipsController', () => {
  it('lists the current actor memberships and sets response metadata', async () => {
    const memberships: MockMembershipService = {
      listMine: jest.fn<MembershipService['listMine']>().mockResolvedValue([membershipResponse]),
    };
    const { headers, response } = createResponse('request-123');
    const controller = new MembershipsController(memberships as unknown as MembershipService);

    await expect(controller.listMine(actor, response)).resolves.toEqual([membershipResponse]);

    expect(memberships.listMine).toHaveBeenCalledWith(actor);
    expect(headers['X-Request-Id']).toBe('request-123');
    expect(headers['Cache-Control']).toBe('no-store');
  });
});
