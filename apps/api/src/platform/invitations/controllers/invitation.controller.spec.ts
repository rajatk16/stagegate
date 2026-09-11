import type { Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';

import type { AuthenticatedUser } from '../../auth';
import { MembershipRole, MembershipStatus } from '../../tenancy';
import type { InvitationService } from '../services';
import { type AcceptedInvitationResponse } from '../types';
import { InvitationsController } from './invitation.controller';

type MockInvitationService = jest.Mocked<Pick<InvitationService, 'accept'>>;
type StoredHeaderValue = number | string | string[];

const actor: AuthenticatedUser = {
  uid: 'user-123',
  email: 'invitee@example.test',
  emailVerified: true,
  authTime: 1_700_000_000,
};

const acceptedInvitation: AcceptedInvitationResponse = {
  organizationId: 'abcDEF1234567890wxyz',
  membershipId: 'abcDEF1234567890wxyz_user-123',
  role: MembershipRole.REVIEWER,
  status: MembershipStatus.ACTIVE,
};

const acceptBody = {
  token: 'a'.repeat(64),
};

function createInvitationService(): MockInvitationService {
  return {
    accept: jest.fn<InvitationService['accept']>(),
  };
}

function createResponse(existingRequestId?: string): {
  response: Response;
  headers: Record<string, StoredHeaderValue>;
} {
  const headers: Record<string, StoredHeaderValue> =
    existingRequestId === undefined
      ? {}
      : { 'X-Request-Id': existingRequestId };
  const response = {} as Response;
  const getHeader = jest.fn<Response['getHeader']>(
    (name) => headers[String(name)],
  );
  const setHeader = jest.fn<Response['setHeader']>((name, value) => {
    headers[name] =
      typeof value === 'string' || typeof value === 'number'
        ? value
        : [...value];
    return response;
  });

  response.getHeader = getHeader;
  response.setHeader = setHeader;

  return { response, headers };
}

describe('InvitationsController', () => {
  it('accepts an invitation and forwards the existing request id', async () => {
    const invitations = createInvitationService();
    invitations.accept.mockResolvedValue(acceptedInvitation);
    const { headers, response } = createResponse('request-123');
    const controller = new InvitationsController(
      invitations as unknown as InvitationService,
    );

    await expect(controller.accept(actor, acceptBody, response)).resolves.toBe(
      acceptedInvitation,
    );

    expect(invitations.accept).toHaveBeenCalledWith(
      actor,
      acceptBody,
      'request-123',
    );
    expect(headers['X-Request-Id']).toBe('request-123');
    expect(headers['Cache-Control']).toBe('no-store');
  });

  it('generates a request id when one is not already present', async () => {
    const invitations = createInvitationService();
    invitations.accept.mockResolvedValue(acceptedInvitation);
    const { headers, response } = createResponse();
    const controller = new InvitationsController(
      invitations as unknown as InvitationService,
    );

    await controller.accept(actor, acceptBody, response);

    const requestId = headers['X-Request-Id'];

    if (typeof requestId !== 'string') {
      throw new Error('Expected a generated request id.');
    }

    expect(requestId).toEqual(expect.any(String));
    expect(invitations.accept).toHaveBeenCalledWith(
      actor,
      acceptBody,
      requestId,
    );
  });
});
