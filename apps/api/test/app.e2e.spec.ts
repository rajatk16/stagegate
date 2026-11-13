import { Server } from 'node:http';

import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configureApp';
import { HealthService } from '../src/health/services/health.service';

import { TestController } from './fixtures/test.controller';

import type { NestExpressApplication } from '@nestjs/platform-express';

describe('StageGate API integration', () => {
  let app: NestExpressApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>({
      bodyParser: false,
      logger: false,
    });

    configureApp(app);

    await app.init();

    const httpServer: unknown = app.getHttpServer();

    if (!(httpServer instanceof Server)) {
      throw new Error('Expected a Node.js HTTP server.');
    }

    server = httpServer;
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns liveness without an API prefix', async () => {
    await request(server)
      .get('/health/live')
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
        });

        expect(body).not.toHaveProperty('success');
      });
  });

  it('returns readiness after bootstrap', async () => {
    await request(server)
      .get('/health/ready')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'ok',
        });
      });
  });

  it('returns 503 when readiness is disabled', async () => {
    const health = app.get(HealthService);

    health.markNotReady();

    try {
      await request(server)
        .get('/health/ready')
        .expect(503)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            status: 'unavailable',
          });
        });
    } finally {
      health.onApplicationBootstrap();
    }
  });

  it('keeps liveness available when not ready', async () => {
    const health = app.get(HealthService);

    health.markNotReady();

    try {
      await request(server).get('/health/live').expect(200);
    } finally {
      health.onApplicationBootstrap();
    }
  });

  it('wraps successful API responses', async () => {
    await request(server)
      .get('/api/v1/test-fixture/success')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: true,

          data: {
            name: 'StageGate',
          },

          meta: {
            requestId: expect.any(String),
            timestamp: expect.any(String),
          },
        });
      });
  });

  it('requires the configured API version', async () => {
    await request(server).get('/api/test-fixture/success').expect(404);
  });

  it('returns a standardized 404 response', async () => {
    await request(server)
      .get('/api/v1/unknown')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: false,

          error: {
            code: 'NOT_FOUND',
          },
        });
      });
  });

  it('validates valid request bodies', async () => {
    await request(server)
      .post('/api/v1/test-fixture/validate')
      .send({
        name: 'StageGate',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: true,

          data: {
            name: 'StageGate',
          },
        });
      });
  });

  it('returns structured validation errors', async () => {
    await request(server)
      .post('/api/v1/test-fixture/validate')
      .send({
        name: 'a',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: false,

          error: {
            code: 'VALIDATION_ERROR',

            details: [
              {
                field: 'name',
                messages: expect.any(Array),
              },
            ],
          },
        });
      });
  });

  it('rejects unexpected DTO properties', async () => {
    await request(server)
      .post('/api/v1/test-fixture/validate')
      .send({
        name: 'StageGate',
        role: 'owner',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: {
            code: 'VALIDATION_ERROR',
          },
        });
      });
  });

  it('rejects malformed JSON with a request ID', async () => {
    await request(server)
      .post('/api/v1/test-fixture/validate')
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400)
      .expect('X-Request-Id', /.+/)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: false,

          error: {
            code: 'BAD_REQUEST',
          },
        });
      });
  });

  it('rejects oversized request bodies', async () => {
    await request(server)
      .post('/api/v1/test-fixture/validate')
      .send({
        name: 'x'.repeat(1024 * 1024 + 100),
      })
      .expect(413)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: {
            code: 'PAYLOAD_TOO_LARGE',
          },
        });
      });
  });

  it('preserves trusted application error codes', async () => {
    await request(server)
      .get('/api/v1/test-fixture/conflict')
      .expect(409)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: false,

          error: {
            code: 'TEST_CONFLICT',
            message: 'A test conflict occurred.',
          },
        });
      });
  });

  it('sanitizes generic HTTP exceptions', async () => {
    await request(server)
      .get('/api/v1/test-fixture/not-found')
      .expect(404)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found.',
          },
        });

        expect(JSON.stringify(body)).not.toContain('Sensitive internal resource identifier');
      });
  });

  it('sanitizes unexpected server errors', async () => {
    await request(server)
      .get('/api/v1/test-fixture/failure')
      .expect(500)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          success: false,

          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.',
          },
        });

        expect(JSON.stringify(body)).not.toContain('Sensitive database credentials');

        expect(body).not.toHaveProperty('stack');
      });
  });

  it('preserves raw responses', async () => {
    await request(server).get('/api/v1/test-fixture/raw').expect(200).expect({
      status: 'raw',
    });
  });

  it('does not wrap HTTP 204 responses', async () => {
    const response = await request(server).get('/api/v1/test-fixture/empty').expect(204);

    expect(response.text).toBe('');
  });

  it('returns consistent request IDs', async () => {
    await request(server)
      .get('/api/v1/test-fixture/context')
      .expect(200)
      .expect((response) => {
        const requestId: unknown = response.headers['x-request-id'];

        expect(typeof requestId).toBe('string');

        expect(response.body).toMatchObject({
          data: {
            requestId,
          },

          meta: {
            requestId,
          },
        });
      });
  });

  it('generates unique request IDs', async () => {
    const responses = await Promise.all([
      request(server).get('/health/live'),
      request(server).get('/health/live'),
    ]);

    expect(responses[0].headers['x-request-id']).not.toBe(responses[1].headers['x-request-id']);
  });

  it('does not trust client-supplied request IDs', async () => {
    await request(server)
      .get('/health/live')
      .set('X-Request-Id', 'untrusted-client-id')
      .expect((response) => {
        expect(response.headers['x-request-id']).not.toBe('untrusted-client-id');
      });
  });

  it('allows the configured CORS origin', async () => {
    await request(server)
      .get('/health/live')
      .set('Origin', 'http://localhost:3000')
      .expect('Access-Control-Allow-Origin', 'http://localhost:3000');
  });

  it('does not allow an unknown CORS origin', async () => {
    await request(server)
      .get('/health/live')
      .set('Origin', 'https://untrusted.example.com')
      .expect((response) => {
        expect(response.headers['access-control-allow-origin']).toBeUndefined();
      });
  });

  it('handles CORS preflight requests', async () => {
    await request(server)
      .options('/api/v1/test-fixture/validate')
      .set('Origin', 'http://localhost:3000')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'authorization,content-type')
      .expect(204);
  });

  it('includes security headers', async () => {
    await request(server)
      .get('/health/live')
      .expect('X-Content-Type-Options', 'nosniff')
      .expect((response) => {
        expect(response.headers['x-powered-by']).toBeUndefined();
      });
  });

  it('exposes Swagger documentation', async () => {
    await request(server).get('/docs/').expect(200);
  });

  it('exposes the OpenAPI document', async () => {
    await request(server)
      .get('/docs/openapi.json')
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          openapi: expect.any(String),

          paths: expect.objectContaining({
            '/health/live': expect.any(Object),
            '/health/ready': expect.any(Object),

            '/api/v1/test-fixture/success': expect.any(Object),
          }),
        });
      });
  });
});
