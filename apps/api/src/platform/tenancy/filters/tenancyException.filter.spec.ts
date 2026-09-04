import type { Request, Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';
import type { ArgumentsHost } from '@nestjs/common';

import { TenancyError } from '../utils';
import { TenancyExceptionFilter } from './tenancyException.filter';

type StoredHeaderValue = number | string | string[];

function createHost(path = '/api/v1/organizations'): {
  host: ArgumentsHost;
  headers: Record<string, StoredHeaderValue>;
  status: jest.MockedFunction<Response['status']>;
  type: jest.MockedFunction<Response['type']>;
  json: jest.MockedFunction<Response['json']>;
} {
  const headers: Record<string, StoredHeaderValue> = {};
  const request = { path } as Request;
  const response = {} as Response;
  const getHeader = jest.fn<Response['getHeader']>((name) => headers[String(name)]);
  const setHeader = jest.fn<Response['setHeader']>((name, value) => {
    headers[name] = typeof value === 'string' || typeof value === 'number' ? value : [...value];
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

describe('TenancyExceptionFilter', () => {
  it('writes a validation problem response with field errors', () => {
    const { headers, host, json, status, type } = createHost();
    headers['X-Request-Id'] = 'request-123';
    const filter = new TenancyExceptionFilter();

    filter.catch(
      new TenancyError('VALIDATION_ERROR', [
        {
          path: 'name',
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
      type: 'https://stagegate.dev/problems/validation-error',
      status: 422,
      title: 'Request validation failed',
      detail: 'Check the supplied organization fields.',
      code: 'VALIDATION_ERROR',
      instance: '/api/v1/organizations',
      requestId: 'request-123',
      errors: [
        {
          path: 'name',
          code: 'INVALID_FIELD',
          message: 'Invalid, missing, or unsupported field.',
        },
      ],
    });
  });

  it.each([
    ['ACTOR_NOT_BOOTSTRAPPED', 409, 'Account setup required'],
    ['ORGANIZATION_NOT_FOUND', 404, 'Organization not found'],
    ['TENANCY_DATA_INVALID', 500, 'Organization unavailable'],
    ['TENANCY_UNAVAILABLE', 503, 'Organization service unavailable'],
  ] as const)('maps %s to its problem response', (code, expectedStatus, title) => {
    const { headers, host, json, status } = createHost('/api/v1/organizations/org123');
    const filter = new TenancyExceptionFilter();

    filter.catch(new TenancyError(code), host);

    expect(headers['X-Request-Id']).toEqual(expect.any(String));
    expect(status).toHaveBeenCalledWith(expectedStatus);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: `https://stagegate.dev/problems/${code.toLowerCase().replaceAll('_', '-')}`,
        status: expectedStatus,
        title,
        code,
        instance: '/api/v1/organizations/org123',
        requestId: headers['X-Request-Id'],
      }),
    );
    expect(json.mock.calls[0]?.[0]).not.toHaveProperty('errors');
  });
});
