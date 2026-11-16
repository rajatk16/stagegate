import { createServer } from 'node:http';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { CLIENT_ERROR_CODES, createApiClient } from '../src/index.js';

import type { ServerResponse } from 'node:http';

const timestamp = '2026-11-16T10:00:00.000Z';

const meta = {
  requestId: 'server-request-123',

  timestamp,
};

const itemSchema = z.object({
  id: z.string(),

  name: z.string(),
});

const headersSchema = z.object({
  authorization: z.string().nullable(),

  requestId: z.string().nullable(),
});

function sendJson(
  response: ServerResponse,

  status: number,

  body: unknown,
): void {
  response.writeHead(status, {
    'Content-Type': 'application/json',

    'X-Request-Id': meta.requestId,
  });

  response.end(JSON.stringify(body));
}

function success<T>(data: T) {
  return {
    success: true,

    data,

    meta,
  };
}

describe('StageGateApiClient', () => {
  let baseUrl: string;

  const server = createServer((request, response) => {
    const url = new URL(
      request.url ?? '/',

      'http://localhost',
    );

    switch (url.pathname) {
      case '/api/v1/items': {
        sendJson(
          response,
          200,
          success({
            id: '123',

            name: 'StageGate',
          }),
        );

        return;
      }

      case '/api/v1/headers': {
        sendJson(
          response,
          200,
          success({
            authorization: request.headers.authorization ?? null,

            requestId: request.headers['x-request-id'] ?? null,
          }),
        );

        return;
      }

      case '/api/v1/query': {
        sendJson(
          response,
          200,
          success({
            search: url.searchParams.get('search'),
          }),
        );

        return;
      }

      case '/api/v1/body': {
        const chunks: Buffer[] = [];

        request.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        request.on('end', () => {
          const body: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));

          sendJson(response, 201, success(body));
        });

        return;
      }

      case '/api/v1/invalid': {
        sendJson(
          response,
          200,
          success({
            id: 123,

            name: 'StageGate',
          }),
        );

        return;
      }

      case '/api/v1/unauthorized': {
        sendJson(response, 401, {
          success: false,

          error: {
            code: 'UNAUTHORIZED',

            message: 'Sign in to continue.',
          },

          meta,
        });

        return;
      }

      case '/api/v1/validation': {
        sendJson(response, 400, {
          success: false,

          error: {
            code: 'VALIDATION_ERROR',

            message: 'Validation failed.',

            details: [
              {
                field: 'name',

                message: 'Name is required.',
              },
            ],
          },

          meta,
        });

        return;
      }

      case '/api/v1/rate-limited': {
        response.setHeader('Retry-After', '5');

        sendJson(response, 429, {
          success: false,

          error: {
            code: 'TOO_MANY_REQUESTS',

            message: 'Try again later.',
          },

          meta,
        });

        return;
      }

      case '/api/v1/unavailable': {
        response.writeHead(503, {
          'Content-Type': 'text/plain',
        });

        response.end('Upstream service unavailable');

        return;
      }

      case '/api/v1/slow': {
        const timer = setTimeout(() => {
          sendJson(
            response,
            200,
            success({
              id: '123',

              name: 'StageGate',
            }),
          );
        }, 1000);

        response.on('close', () => {
          clearTimeout(timer);
        });

        return;
      }

      case '/health/live': {
        sendJson(response, 200, {
          status: 'ok',

          timestamp,
        });

        return;
      }

      case '/health/ready': {
        sendJson(response, 503, {
          status: 'unavailable',

          timestamp,
        });

        return;
      }

      default: {
        sendJson(response, 404, {
          success: false,

          error: {
            code: 'NOT_FOUND',

            message: 'Not found.',
          },

          meta,
        });
      }
    }
  });

  beforeAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);

      server.listen(0, '127.0.0.1', () => {
        server.off('error', reject);

        resolve();
      });
    });

    const address = server.address();

    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP server address.');
    }

    baseUrl = `http://127.0.0.1:${String(address.port)}/api/v1`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      server.closeAllConnections();
    });
  });

  function createClient() {
    return createApiClient({
      baseUrl,

      requestIdFactory: () => 'client-request-123',

      tokenProvider: {
        getToken: () => Promise.resolve('test-token'),
      },
    });
  }

  it('returns validated response data', async () => {
    const client = createClient();

    const result = await client.get(
      '/items',

      itemSchema,
    );

    expect(result).toEqual({
      id: '123',

      name: 'StageGate',
    });
  });

  it('preserves metadata for generic requests', async () => {
    const client = createClient();

    const result = await client.request({
      method: 'GET',

      path: '/items',

      schema: itemSchema,
    });

    expect(result.meta).toEqual(meta);
  });

  it('attaches authentication and request IDs', async () => {
    const client = createClient();

    const result = await client.get(
      '/headers',

      headersSchema,
    );

    expect(result).toEqual({
      authorization: 'Bearer test-token',

      requestId: 'client-request-123',
    });
  });

  it('resolves a fresh token for every request', async () => {
    let token = 'first-token';

    const client = createApiClient({
      baseUrl,

      tokenProvider: {
        getToken: () => Promise.resolve(token),
      },
    });

    const first = await client.get(
      '/headers',

      headersSchema,
    );

    token = 'second-token';

    const second = await client.get(
      '/headers',

      headersSchema,
    );

    expect(first.authorization).toBe('Bearer first-token');

    expect(second.authorization).toBe('Bearer second-token');
  });

  it('omits tokens from public requests', async () => {
    const getToken = vi.fn().mockResolvedValue('test-token');

    const client = createApiClient({
      baseUrl,

      tokenProvider: {
        getToken,
      },
    });

    const result = await client.get(
      '/headers',

      headersSchema,

      {
        auth: 'none',
      },
    );

    expect(result.authorization).toBeNull();

    expect(getToken).not.toHaveBeenCalled();
  });

  it('allows optional authentication', async () => {
    const client = createApiClient({
      baseUrl,
    });

    const result = await client.get(
      '/headers',

      headersSchema,

      {
        auth: 'optional',
      },
    );

    expect(result.authorization).toBeNull();
  });

  it('rejects missing required authentication', async () => {
    const client = createApiClient({
      baseUrl,
    });

    await expect(client.get('/items', itemSchema)).rejects.toMatchObject({
      kind: 'authentication',

      code: CLIENT_ERROR_CODES.AUTH_REQUIRED,
    });
  });

  it('normalizes token provider failures', async () => {
    const client = createApiClient({
      baseUrl,

      tokenProvider: {
        getToken: () => Promise.reject(new Error('Token provider failed.')),
      },
    });

    await expect(client.get('/items', itemSchema)).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.AUTH_TOKEN_ERROR,
    });
  });

  it('serializes query parameters', async () => {
    const client = createClient();

    const result = await client.get(
      '/query',

      z.object({
        search: z.string(),
      }),

      {
        query: {
          search: 'React India',
        },
      },
    );

    expect(result.search).toBe('React India');
  });

  it('serializes JSON request bodies', async () => {
    const client = createClient();

    const body = {
      id: '123',

      name: 'StageGate',
    };

    const result = await client.post(
      '/body',

      body,

      itemSchema,
    );

    expect(result).toEqual(body);
  });

  it('rejects malformed successful responses', async () => {
    const client = createClient();

    await expect(client.get('/invalid', itemSchema)).rejects.toMatchObject({
      kind: 'contract',

      code: CLIENT_ERROR_CODES.INVALID_RESPONSE,

      requestId: meta.requestId,
    });
  });

  it('normalizes server validation errors', async () => {
    const client = createClient();

    await expect(client.get('/validation', itemSchema)).rejects.toMatchObject({
      kind: 'http',

      status: 400,

      code: 'VALIDATION_ERROR',

      details: [
        {
          field: 'name',

          message: 'Name is required.',
        },
      ],
    });
  });

  it('notifies the unauthorized callback', async () => {
    const onUnauthorized = vi.fn();

    const client = createApiClient({
      baseUrl,

      onUnauthorized,

      tokenProvider: {
        getToken: () => Promise.resolve('test-token'),
      },
    });

    await expect(
      client.get(
        '/unauthorized',

        itemSchema,
      ),
    ).rejects.toMatchObject({
      status: 401,
    });

    expect(onUnauthorized).toHaveBeenCalledWith({
      requestId: meta.requestId,
    });
  });

  it('does not notify for public 401 responses', async () => {
    const onUnauthorized = vi.fn();

    const client = createApiClient({
      baseUrl,

      onUnauthorized,
    });

    await expect(
      client.get(
        '/unauthorized',

        itemSchema,

        {
          auth: 'none',
        },
      ),
    ).rejects.toMatchObject({
      status: 401,
    });

    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('preserves Retry-After information', async () => {
    const client = createClient();

    await expect(
      client.get(
        '/rate-limited',

        itemSchema,
      ),
    ).rejects.toMatchObject({
      status: 429,

      retryAfterMs: 5000,

      isRetryable: true,
    });
  });

  it('normalizes non-JSON HTTP errors', async () => {
    const client = createClient();

    await expect(
      client.get(
        '/unavailable',

        itemSchema,
      ),
    ).rejects.toMatchObject({
      kind: 'http',

      status: 503,

      code: 'SERVICE_UNAVAILABLE',
    });
  });

  it('normalizes request timeouts', async () => {
    const client = createApiClient({
      baseUrl,

      timeoutMs: 100,
    });

    await expect(
      client.get(
        '/slow',

        itemSchema,

        {
          auth: 'none',
        },
      ),
    ).rejects.toMatchObject({
      kind: 'timeout',

      code: CLIENT_ERROR_CODES.TIMEOUT,
    });
  });

  it('rejects already cancelled requests', async () => {
    const client = createClient();

    const controller = new AbortController();

    controller.abort();

    await expect(
      client.get(
        '/items',

        itemSchema,

        {
          signal: controller.signal,
        },
      ),
    ).rejects.toMatchObject({
      kind: 'cancelled',
    });
  });

  it('cancels in-flight requests', async () => {
    const client = createClient();

    const controller = new AbortController();

    const request = client.get(
      '/slow',

      itemSchema,

      {
        signal: controller.signal,
      },
    );

    const assertion = expect(request).rejects.toMatchObject({
      kind: 'cancelled',
    });

    const timer = setTimeout(() => {
      controller.abort();
    }, 25);

    try {
      await assertion;
    } finally {
      clearTimeout(timer);
    }
  });

  it.each([
    'https://example.com/items',
    '//example.com/items',
    '/../items',
    '/%2e%2e/items',
    '/items/%2fprivate',
    '/items/%5cprivate',
  ])('rejects unsafe request path %s', async (path) => {
    const client = createClient();

    await expect(client.get(path, itemSchema)).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.INVALID_REQUEST,
    });
  });

  it('rejects reserved header overrides', async () => {
    const client = createClient();

    await expect(
      client.get(
        '/items',

        itemSchema,

        {
          headers: {
            Authorization: 'Bearer override',
          },
        },
      ),
    ).rejects.toMatchObject({
      code: CLIENT_ERROR_CODES.INVALID_REQUEST,
    });
  });

  it('calls unversioned liveness endpoints', async () => {
    const client = createClient();

    expect(await client.health.liveness()).toEqual({
      status: 'ok',

      timestamp,
    });
  });

  it('accepts valid unavailable readiness responses', async () => {
    const client = createClient();

    expect(await client.health.readiness()).toEqual({
      status: 'unavailable',

      timestamp,
    });
  });

  it('rejects invalid base URLs', () => {
    expect(() =>
      createApiClient({
        baseUrl: 'https://example.com',
      }),
    ).toThrow();
  });
});
