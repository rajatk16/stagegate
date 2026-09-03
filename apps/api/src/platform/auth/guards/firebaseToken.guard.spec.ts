import type { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';
import { Logger, type ExecutionContext } from '@nestjs/common';
import type { Auth, DecodedIdToken } from 'firebase-admin/auth';

import type { AuthenticatedRequest } from '../types';
import { FirebaseTokenGuard } from './firebaseToken.guard';
import { type AuthenticationError } from '../utils';
import { type AuthenticationAuditWriter } from '../services';

const decodedToken: DecodedIdToken = {
  aud: 'stagegate-test',
  auth_time: 1_700_000_000,
  exp: 1_700_003_600,
  iat: 1_700_000_000,
  iss: 'https://securetoken.google.com/stagegate-test',
  sub: 'user-123',
  uid: 'user-123',
  email: 'person@example.test',
  email_verified: true,
  firebase: {
    identities: {},
    sign_in_provider: 'password',
  },
};

const handler = (): undefined => undefined;
class Controller {}

function createRequest(
  authorization?: string,
  rawHeaders: string[] = authorization === undefined ? [] : ['Authorization', authorization],
): AuthenticatedRequest {
  return {
    headers: authorization === undefined ? {} : { authorization },
    rawHeaders,
  } as AuthenticatedRequest;
}

function createExecutionContext(request: AuthenticatedRequest): ExecutionContext {
  const headers: Record<string, string> = {};

  const response = {
    getHeader: (name: string) => headers[name],
    setHeader: (name: string, value: string) => {
      headers[name] = value;
      return response;
    },
  } as unknown as Response;

  return {
    getClass: () => Controller,
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;
}

function createGuard(): {
  guard: FirebaseTokenGuard;
  getAllAndOverride: jest.MockedFunction<Reflector['getAllAndOverride']>;
  verifyIdToken: jest.MockedFunction<Auth['verifyIdToken']>;
  recordDenied: jest.MockedFunction<AuthenticationAuditWriter['recordDenied']>;
} {
  const getAllAndOverride = jest.fn<Reflector['getAllAndOverride']>();
  const verifyIdToken = jest.fn<Auth['verifyIdToken']>();

  const reflector = {
    getAllAndOverride,
  } as Pick<Reflector, 'getAllAndOverride'>;

  const recordDenied = jest.fn<AuthenticationAuditWriter['recordDenied']>();

  const audit = {
    recordDenied,
  } as AuthenticationAuditWriter;

  return {
    guard: new FirebaseTokenGuard(reflector as Reflector, { verifyIdToken }, audit),
    getAllAndOverride,
    verifyIdToken,
    recordDenied,
  };
}

describe('FirebaseTokenGuard', () => {
  it('allows public routes without verifying a token', async () => {
    const { getAllAndOverride, guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer ignored');
    request.actor = {
      uid: 'stale-user',
      email: null,
      emailVerified: false,
      authTime: 1,
    };

    getAllAndOverride.mockReturnValue(true);

    await expect(guard.canActivate(createExecutionContext(request))).resolves.toBe(true);

    expect(request.actor).toBeUndefined();
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('requires an authorization header for protected routes', async () => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest();

    await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
      code: 'AUTH_REQUIRED',
    } satisfies Partial<AuthenticationError>);

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it.each(['Basic credentials', 'Bearer', 'Bearer token extra', 'Bearer first,Bearer second'])(
    'rejects malformed authorization header: %s',
    async (authorization) => {
      const { guard, verifyIdToken } = createGuard();
      const request = createRequest(authorization);

      await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
        code: 'AUTH_INVALID_TOKEN',
      } satisfies Partial<AuthenticationError>);

      expect(verifyIdToken).not.toHaveBeenCalled();
    },
  );

  it('rejects duplicate authorization headers', async () => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer first', [
      'Authorization',
      'Bearer first',
      'Authorization',
      'Bearer second',
    ]);

    await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
      code: 'AUTH_INVALID_TOKEN',
    } satisfies Partial<AuthenticationError>);

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('adds the allowlisted actor fields from a verified token', async () => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('bearer test-token');

    verifyIdToken.mockResolvedValue(decodedToken);

    await expect(guard.canActivate(createExecutionContext(request))).resolves.toBe(true);

    expect(verifyIdToken).toHaveBeenCalledWith('test-token', true);
    expect(request.actor).toEqual({
      uid: 'user-123',
      email: 'person@example.test',
      emailVerified: true,
      authTime: 1_700_000_000,
    });
  });

  it('normalizes a missing token email to null', async () => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer test-token');
    const decodedWithoutEmail = { ...decodedToken };
    delete decodedWithoutEmail.email;

    verifyIdToken.mockResolvedValue(decodedWithoutEmail);

    await expect(guard.canActivate(createExecutionContext(request))).resolves.toBe(true);

    expect(request.actor).toEqual({
      uid: 'user-123',
      email: null,
      emailVerified: true,
      authTime: 1_700_000_000,
    });
  });

  it.each([
    'auth/argument-error',
    'auth/invalid-argument',
    'auth/invalid-id-token',
  ])('maps Firebase token error %s to an invalid-token error', async (code) => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer rejected-token');

    verifyIdToken.mockRejectedValue({
      code,
      message: 'Sensitive upstream error details',
    });

    await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
      code: 'AUTH_INVALID_TOKEN',
    } satisfies Partial<AuthenticationError>);
  });

  it('maps expired Firebase tokens to an expired-token error', async () => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer expired-token');

    verifyIdToken.mockRejectedValue({
      code: 'auth/id-token-expired',
      message: 'Sensitive upstream error details',
    });

    await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
      code: 'AUTH_TOKEN_EXPIRED',
    } satisfies Partial<AuthenticationError>);
  });

  it.each([
    ['auth/id-token-revoked', 'AUTH_TOKEN_REVOKED'],
    ['auth/user-disabled', 'AUTH_USER_DISABLED'],
    ['auth/user-not-found', 'AUTH_INVALID_TOKEN'],
  ] as const)('maps Firebase token error %s to %s', async (firebaseCode, expectedCode) => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer rejected-token');

    verifyIdToken.mockRejectedValue({
      code: firebaseCode,
      message: 'Sensitive upstream error details',
    });

    await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
      code: expectedCode,
    } satisfies Partial<AuthenticationError>);
  });

  it('fails closed when Firebase token verification fails unexpectedly', async () => {
    const { guard, verifyIdToken } = createGuard();
    const request = createRequest('Bearer test-token');
    const loggerError = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    verifyIdToken.mockRejectedValue({
      code: 'auth/internal-error',
      message: 'Sensitive upstream error details',
    });

    await expect(guard.canActivate(createExecutionContext(request))).rejects.toMatchObject({
      code: 'AUTH_UNAVAILABLE',
    } satisfies Partial<AuthenticationError>);

    expect(request.actor).toBeUndefined();
    expect(loggerError).toHaveBeenCalledWith('Firebase token verification failed unexpectedly.');
  });
});
