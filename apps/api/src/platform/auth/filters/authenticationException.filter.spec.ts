import type { Request, Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';
import type { ArgumentsHost } from '@nestjs/common';

import { AuthenticationError } from '../utils';
import { AuthenticationExceptionFilter } from './authenticationException.filter';

type StoredHeaderValue = number | string | string[];

function createHost(path = '/api/v1/auth/session'): {
  host: ArgumentsHost;
  headers: Record<string, StoredHeaderValue>;
  status: jest.MockedFunction<Response['status']>;
  type: jest.MockedFunction<Response['type']>;
  json: jest.MockedFunction<Response['json']>;
} {
  const headers: Record<string, StoredHeaderValue> = {};
  const request = { path } as Request;
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
  const status = jest.fn<Response['status']>().mockReturnValue(response);
  const type = jest.fn<Response['type']>().mockReturnValue(response);
  const json = jest.fn<Response['json']>().mockReturnValue(response);

  response.getHeader = getHeader;
  response.setHeader = setHeader;
  response.status = status;
  response.type = type;
  response.json = json;

  const host = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as ArgumentsHost;

  return { host, headers, status, type, json };
}

describe('AuthenticationExceptionFilter', () => {
  it('returns a bearer challenge for missing credentials', () => {
    const { headers, host, json, status, type } = createHost();
    const filter = new AuthenticationExceptionFilter();

    filter.catch(new AuthenticationError('AUTH_REQUIRED'), host);

    expect(headers['X-Request-Id']).toEqual(expect.any(String));
    expect(headers['Cache-Control']).toBe('no-store');
    expect(headers['WWW-Authenticate']).toBe('Bearer');
    expect(status).toHaveBeenCalledWith(401);
    expect(type).toHaveBeenCalledWith('application/problem+json');
    expect(json).toHaveBeenCalledWith({
      type: 'https://stagegate.dev/problems/auth-required',
      title: 'Authentication required',
      status: 401,
      code: 'AUTH_REQUIRED',
      detail: 'A valid Firebase ID token is required.',
      instance: '/api/v1/auth/session',
      requestId: headers['X-Request-Id'],
    });
  });

  it('preserves an existing request id and marks invalid bearer tokens', () => {
    const { headers, host, json, status } = createHost('/api/v1/users/me');
    headers['X-Request-Id'] = 'request-123';
    const filter = new AuthenticationExceptionFilter();

    filter.catch(new AuthenticationError('AUTH_TOKEN_REVOKED'), host);

    expect(headers['X-Request-Id']).toBe('request-123');
    expect(headers['WWW-Authenticate']).toBe('Bearer error="invalid_token"');
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'https://stagegate.dev/problems/auth-token-revoked',
        title: 'Authentication session invalid',
        code: 'AUTH_TOKEN_REVOKED',
        requestId: 'request-123',
      }),
    );
  });

  it.each([
    ['EMAIL_VERIFICATION_REQUIRED', 403, 'Email verification required'],
    ['AUTH_UNAVAILABLE', 503, 'Authentication unavailable'],
  ] as const)(
    'maps %s to the expected problem title',
    (code, expectedStatus, title) => {
      const { headers, host, json, status } = createHost('/api/v1/users/me');
      const filter = new AuthenticationExceptionFilter();

      filter.catch(new AuthenticationError(code), host);

      expect(headers['WWW-Authenticate']).toBeUndefined();
      expect(status).toHaveBeenCalledWith(expectedStatus);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          title,
          status: expectedStatus,
          code,
        }),
      );
    },
  );
});
