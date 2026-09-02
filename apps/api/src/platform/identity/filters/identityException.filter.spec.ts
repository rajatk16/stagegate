import type { Request, Response } from 'express';
import type { ArgumentsHost } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';

import { IdentityError } from '../utils';
import { IdentityExceptionFilter } from './identityException.filter';

type StoredHeaderValue = number | string | string[];

function createHost(path = '/api/v1/users/me'): {
  host: ArgumentsHost;
  response: Response;
  headers: Record<string, StoredHeaderValue>;
  status: jest.MockedFunction<Response['status']>;
  type: jest.MockedFunction<Response['type']>;
  json: jest.MockedFunction<Response['json']>;
  getHeader: jest.MockedFunction<Response['getHeader']>;
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

  return { host, response, headers, status, type, json, getHeader };
}

describe('IdentityExceptionFilter', () => {
  it('writes a validation problem response with field errors', () => {
    const { headers, host, json, status, type } = createHost();
    headers['X-Request-Id'] = 'request-123';
    const filter = new IdentityExceptionFilter();

    filter.catch(
      new IdentityError('VALIDATION_FAILED', [
        {
          path: 'displayName',
          code: 'INVALID_FIELD',
          message: 'Invalid, missing, or unsupported field.',
        },
      ]),
      host,
    );

    expect(headers['X-Request-Id']).toBe('request-123');
    expect(headers['Cache-Control']).toBe('no-store');
    expect(status).toHaveBeenCalledWith(422);
    expect(type).toHaveBeenCalledWith('application/problem+json');
    expect(json).toHaveBeenCalledWith({
      type: 'https://stagegate.dev/problems/validation-failed',
      status: 422,
      title: 'Request validation failed',
      detail: 'Check the supplied profile fields.',
      code: 'VALIDATION_FAILED',
      instance: '/api/v1/users/me',
      requestId: 'request-123',
      errors: [
        {
          path: 'displayName',
          code: 'INVALID_FIELD',
          message: 'Invalid, missing, or unsupported field.',
        },
      ],
    });
  });

  it.each([
    ['USER_NOT_BOOTSTRAPPED', 404, 'Profile not found'],
    ['CONCURRENCY_CONFLICT', 409, 'Profile version conflict'],
    ['PROFILE_DATA_INVALID', 500, 'Profile unavailable'],
    ['PROFILE_UNAVAILABLE', 503, 'Profile service unavailable'],
  ] as const)(
    'maps %s to its problem response',
    (code, expectedStatus, title) => {
      const { headers, host, json, status } = createHost(
        '/api/v1/users/me/bootstrap',
      );
      const filter = new IdentityExceptionFilter();

      filter.catch(new IdentityError(code), host);

      expect(headers['X-Request-Id']).toEqual(expect.any(String));
      expect(status).toHaveBeenCalledWith(expectedStatus);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          type: `https://stagegate.dev/problems/${code.toLowerCase().replaceAll('_', '-')}`,
          status: expectedStatus,
          title,
          code,
          instance: '/api/v1/users/me/bootstrap',
          requestId: headers['X-Request-Id'],
        }),
      );
      expect(json.mock.calls[0]?.[0]).not.toHaveProperty('errors');
    },
  );
});
