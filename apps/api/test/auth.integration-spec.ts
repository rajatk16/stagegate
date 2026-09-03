import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Auth, DecodedIdToken } from 'firebase-admin/auth';
import request from 'supertest';
import type { App as HttpApp } from 'supertest/types';

import { FIREBASE_AUTH } from '@stagegate/backend-platform';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configureApplication';

const decodedToken: DecodedIdToken = {
  aud: 'stagegate-test',
  auth_time: 1_700_000_000,
  exp: 1_700_003_600,
  iat: 1_700_000_000,
  iss: 'https://securetoken.google.com/stagegate-test',
  sub: 'user-123',
  uid: 'user-123',
  email: 'person@example.test',
  email_verified: false,
  firebase: {
    identities: {},
    sign_in_provider: 'password',
  },
  organizationId: 'must-not-be-trusted-as-membership',
  roles: ['owner'],
};

describe('API authentication', () => {
  let app: INestApplication<HttpApp>;

  const verifyIdToken = jest.fn<Auth['verifyIdToken']>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FIREBASE_AUTH)
      .useValue({ verifyIdToken })
      .compile();

    app = module.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  beforeEach(() => {
    verifyIdToken.mockReset();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps the root public and skips token verification', async () => {
    await request(app.getHttpServer())
      .get('/api/v1')
      .set('Authorization', 'Bearer ignored-on-public-route')
      .expect(200);

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('requires authentication by default', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .expect(401)
      .expect('Content-Type', /application\/problem\+json/)
      .expect('WWW-Authenticate', 'Bearer');

    expect(response.body).toMatchObject({
      status: 401,
      code: 'AUTH_REQUIRED',
    });
    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it.each([
    'Basic credentials',
    'Bearer',
    'Bearer token extra',
    'Bearer first,Bearer second',
  ])('rejects malformed authorization: %s', async (header) => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', header)
      .expect(401);

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('rejects duplicate Authorization headers', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', 'Bearer first,Bearer second')
      .expect(401);

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('does not accept a token in the query string', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/auth/session?token=not-a-header')
      .expect(401);

    expect(verifyIdToken).not.toHaveBeenCalled();
  });

  it('returns only allowlisted claims from a verified token', async () => {
    verifyIdToken.mockResolvedValue(decodedToken);

    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', 'bearer test-token')
      .expect(200)
      .expect('Cache-Control', 'no-store')
      .expect({
        uid: 'user-123',
        email: 'person@example.test',
        emailVerified: false,
        authTime: 1_700_000_000,
      });

    expect(verifyIdToken).toHaveBeenCalledWith('test-token', true);
    expect(verifyIdToken).toHaveBeenCalledTimes(1);
  });

  it.each([
    'auth/argument-error',
    'auth/invalid-argument',
    'auth/invalid-id-token',
  ])(
    'rejects Firebase token error %s without leaking details',
    async (code) => {
      verifyIdToken.mockRejectedValue({
        code,
        message: 'Sensitive upstream error details',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/session')
        .set('Authorization', 'Bearer rejected-token')
        .expect(401);

      expect(response.body).toMatchObject({
        code: 'AUTH_INVALID_TOKEN',
      });
      expect(JSON.stringify(response.body)).not.toContain('Sensitive');
      expect(JSON.stringify(response.body)).not.toContain('rejected-token');
    },
  );

  it.each([
    ['auth/id-token-expired', 'AUTH_TOKEN_EXPIRED'],
    ['auth/id-token-revoked', 'AUTH_TOKEN_REVOKED'],
    ['auth/user-disabled', 'AUTH_USER_DISABLED'],
  ])(
    'returns a stable session error for %s',
    async (firebaseCode, expectedCode) => {
      verifyIdToken.mockRejectedValue({
        code: firebaseCode,
        message: 'Sensitive upstream details',
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/session')
        .set('Authorization', 'Bearer rejected-token')
        .expect(401)
        .expect('WWW-Authenticate', 'Bearer error="invalid_token"');

      expect(response.body.code).toBe(expectedCode);
      expect(JSON.stringify(response.body)).not.toContain('rejected-token');
      expect(JSON.stringify(response.body)).not.toContain(
        'Sensitive upstream details',
      );
    },
  );

  it('fails closed when verification fails unexpectedly', async () => {
    verifyIdToken.mockRejectedValue({
      code: 'auth/internal-error',
      message: 'Sensitive upstream error details',
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', 'Bearer test-token')
      .expect(503);

    expect(response.body).toMatchObject({
      code: 'AUTH_UNAVAILABLE',
    });
    expect(JSON.stringify(response.body)).not.toContain('Sensitive');
  });

  it('returns a sanitized 403 for an unverified protected mutation', async () => {
    verifyIdToken.mockResolvedValue(decodedToken);

    const response = await request(app.getHttpServer())
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer unverified-token')
      .send({
        expectedVersion: 1,
        displayName: 'Blocked update',
      })
      .expect(403)
      .expect('Content-Type', /application\/problem\+json/);

    expect(response.headers['www-authenticate']).toBeUndefined();

    expect(response.body).toMatchObject({
      type: 'https://stagegate.dev/problems/email-verification-required',
      title: 'Email verification required',
      status: 403,
      code: 'EMAIL_VERIFICATION_REQUIRED',
      detail: 'Verify your email address before performing this action.',
      instance: '/api/v1/users/me',
      requestId: expect.any(String),
    });

    expect(JSON.stringify(response.body)).not.toContain('person@example.test');
  });
});
