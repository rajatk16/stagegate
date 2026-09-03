import type { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';

import type { AuthenticationError } from '../utils';
import { VerifiedEmailGuard } from './verifiedEmail.guard';
import type { AuthenticatedRequest, AuthenticatedUser } from '../types';
import { type AuthenticationAuditWriter } from '../services';

const handler = (): undefined => undefined;
class Controller {}

function createContext(actor?: AuthenticatedUser): ExecutionContext {
  const request = {
    actor,
  } as AuthenticatedRequest;

  return {
    getClass: () => Controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({
        getHeader: () => 'request-test-123',
      }),
    }),
  } as unknown as ExecutionContext;
}

function createGuard(required: boolean | undefined): {
  guard: VerifiedEmailGuard;
  recordDenied: jest.MockedFunction<AuthenticationAuditWriter['recordDenied']>;
} {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(required),
  } as unknown as Reflector;

  const recordDenied = jest.fn<AuthenticationAuditWriter['recordDenied']>();

  return {
    guard: new VerifiedEmailGuard(reflector, {
      recordDenied,
    }),
    recordDenied,
  };
}

describe('VerifiedEmailGuard', () => {
  it('allows routes without a verified-email requirement', () => {
    const { guard } = createGuard(undefined);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows a verified actor with an email address', () => {
    const { guard } = createGuard(true);

    expect(
      guard.canActivate(
        createContext({
          uid: 'user-123',
          email: 'person@example.test',
          emailVerified: true,
          authTime: 1_700_000_000,
        }),
      ),
    ).toBe(true);
  });

  it.each([
    {
      email: 'person@example.test',
      emailVerified: false,
    },
    {
      email: null,
      emailVerified: true,
    },
    {
      email: null,
      emailVerified: false,
    },
  ])('denies an actor without a verified email: %j', ({ email, emailVerified }) => {
    const { guard } = createGuard(true);

    expect(() =>
      guard.canActivate(
        createContext({
          uid: 'user-123',
          email,
          emailVerified,
          authTime: 1_700_000_000,
        }),
      ),
    ).toThrow(
      expect.objectContaining({
        code: 'EMAIL_VERIFICATION_REQUIRED',
      }) as unknown as AuthenticationError,
    );
  });

  it('fails closed if authentication did not attach an actor', () => {
    const { guard } = createGuard(true);

    expect(() => guard.canActivate(createContext())).toThrow(
      expect.objectContaining({
        code: 'AUTH_REQUIRED',
      }) as unknown as AuthenticationError,
    );
  });
});
