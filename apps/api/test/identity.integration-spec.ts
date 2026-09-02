import request from 'supertest';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Auth } from 'firebase-admin/auth';
import type { App as HttpApp } from 'supertest/types';
import type { INestApplication } from '@nestjs/common';
import type { Firestore } from 'firebase-admin/firestore';
import { deleteApp, type App as FirebaseApp } from 'firebase-admin/app';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIRESTORE,
} from '@stagegate/backend-platform';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configureApplication';

jest.setTimeout(45_000);

describe('User profiles with Firestore', () => {
  let app: INestApplication<HttpApp>;
  let firestore: Firestore;
  let userA: string;
  let userB: string;

  const createdUserIds: string[] = [];
  const verifyIdToken = jest.fn<Auth['verifyIdToken']>();

  const api = () => request(app.getHttpServer());

  const bootstrap = (token = 'actor-a') =>
    api()
      .post('/api/v1/users/me/bootstrap')
      .set('Authorization', `Bearer ${token}`)
      .send({});

  const auditEntries = (userId: string) =>
    firestore.collection('auditLogs').where('resourceId', '==', userId).get();

  beforeAll(async () => {
    // Fail before connecting or writing if this is not the test environment.
    expect(process.env['APP_ENV']).toBe('test');
    expect(process.env['FIREBASE_PROJECT_ID']).toBe('stagegate-test');
    expect(process.env['FIRESTORE_EMULATOR_HOST']).toBe('127.0.0.1:8080');

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FIREBASE_AUTH)
      .useValue({ verifyIdToken })
      .compile();

    app = module.createNestApplication();
    configureApplication(app);
    await app.init();

    firestore = app.get<Firestore>(FIRESTORE);
  });

  beforeEach(() => {
    userA = `profile-${randomUUID()}`;
    userB = `profile-${randomUUID()}`;
    createdUserIds.push(userA, userB);

    verifyIdToken.mockReset();
    verifyIdToken.mockImplementation((token) => {
      const usesUserA = new Set([
        'actor-a',
        'unverified-a',
        'verified-without-email',
      ]).has(token);

      const uid = usesUserA ? userA : token === 'actor-b' ? userB : undefined;

      if (uid === undefined) {
        return Promise.reject({
          code: 'auth/invalid-id-token',
        });
      }

      const now = Math.floor(Date.now() / 1_000);
      const hasEmail = token !== 'verified-without-email';
      const emailVerified = token !== 'unverified-a';

      return Promise.resolve({
        uid,
        sub: uid,
        aud: 'stagegate-test',
        iss: 'https://securetoken.google.com/stagegate-test',
        auth_time: now,
        iat: now,
        exp: now + 3_600,
        ...(hasEmail ? { email: `${uid}@example.test` } : {}),
        email_verified: emailVerified,
        firebase: {
          identities: {},
          sign_in_provider: 'password',
        },
      });
    });
  });

  afterAll(async () => {
    if (app === undefined) {
      return;
    }

    try {
      for (const userId of createdUserIds) {
        const audits = await auditEntries(userId);

        await Promise.all([
          firestore.collection('users').doc(userId).delete(),
          ...audits.docs.map((document) => document.ref.delete()),
        ]);
      }
    } finally {
      await firestore.terminate();
      await deleteApp(app.get<FirebaseApp>(FIREBASE_APP));
      await app.close();
    }
  });

  it('requires authentication on all profile endpoints', async () => {
    await api().post('/api/v1/users/me/bootstrap').send({}).expect(401);
    await api().get('/api/v1/users/me').expect(401);
    await api()
      .patch('/api/v1/users/me')
      .send({ expectedVersion: 1, displayName: 'Example' })
      .expect(401);
  });

  it('does not create a profile during GET', async () => {
    await api()
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .expect(404);

    const snapshot = await firestore.collection('users').doc(userA).get();
    expect(snapshot.exists).toBe(false);
    expect((await auditEntries(userA)).size).toBe(0);
  });

  it('creates once under concurrent bootstrap requests', async () => {
    const responses = await Promise.all(
      Array.from({ length: 4 }, () => bootstrap()),
    );

    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 200, 200, 201,
    ]);

    for (const response of responses) {
      expect(response.body).toMatchObject({
        userId: userA,
        displayName: null,
        bio: null,
        emailVerified: true,
        version: 1,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    }

    expect((await auditEntries(userA)).size).toBe(1);

    const stored = await firestore.collection('users').doc(userA).get();
    expect(stored.data()).not.toHaveProperty('email');
    expect(stored.data()).not.toHaveProperty('emailVerified');
    expect(stored.data()).not.toHaveProperty('roles');
  });

  it('preserves edits when bootstrap is repeated', async () => {
    const initial = await bootstrap().expect(201);

    const updated = await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .send({
        expectedVersion: 1,
        displayName: '  Example Speaker  ',
        bio: 'A short biography.',
      })
      .expect(200);

    expect(updated.body).toMatchObject({
      displayName: 'Example Speaker',
      bio: 'A short biography.',
      version: 2,
    });

    const repeated = await bootstrap().expect(200);

    expect(repeated.body).toEqual(updated.body);
    expect(repeated.body.createdAt).toBe(initial.body.createdAt);
    expect((await auditEntries(userA)).size).toBe(2);
  });

  it('allows only one concurrent edit of the same version', async () => {
    await bootstrap().expect(201);

    const responses = await Promise.all(
      ['First edit', 'Second edit'].map((displayName) =>
        api()
          .patch('/api/v1/users/me')
          .set('Authorization', 'Bearer actor-a')
          .send({ expectedVersion: 1, displayName }),
      ),
    );

    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 409,
    ]);

    const current = await api()
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .expect(200);

    expect(current.body.version).toBe(2);
    expect((await auditEntries(userA)).size).toBe(2);
  });

  it('does not write or increment the version for an unchanged field', async () => {
    await bootstrap().expect(201);

    const result = await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .send({ expectedVersion: 1, displayName: null })
      .expect(200);

    expect(result.body.version).toBe(1);
    expect((await auditEntries(userA)).size).toBe(1);
  });

  it.each([
    { expectedVersion: 1 },
    { expectedVersion: '1', displayName: 'Example' },
    { expectedVersion: 1, displayName: '   ' },
    { expectedVersion: 1, displayName: 'Example', roles: ['owner'] },
    { expectedVersion: 1, emailVerified: true },
  ])('rejects invalid or unsupported profile fields: %j', async (body) => {
    await bootstrap().expect(201);

    await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .send(body)
      .expect(422)
      .expect('Content-Type', /application\/problem\+json/);

    expect((await auditEntries(userA)).size).toBe(1);
  });

  it('cannot select another user through request input', async () => {
    await bootstrap().expect(201);
    await bootstrap('actor-b').expect(201);

    await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-b')
      .send({
        expectedVersion: 1,
        userId: userA,
        displayName: 'Attempted overwrite',
      })
      .expect(422);

    await api()
      .get(`/api/v1/users/${userA}`)
      .set('Authorization', 'Bearer actor-b')
      .expect(404);

    const ownProfile = await api()
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-b')
      .expect(200);

    expect(ownProfile.body.userId).toBe(userB);

    const other = await firestore.collection('users').doc(userA).get();
    expect(other.get('displayName')).toBeNull();
  });

  it('rejects ownership fields in bootstrap', async () => {
    await api()
      .post('/api/v1/users/me/bootstrap')
      .set('Authorization', 'Bearer actor-a')
      .send({ userId: userB })
      .expect(422);

    expect((await firestore.collection('users').doc(userA).get()).exists).toBe(
      false,
    );
  });

  it('fails safely on malformed persisted data', async () => {
    await bootstrap().expect(201);

    await firestore.collection('users').doc(userA).update({
      version: 'corrupt-value',
    });

    const response = await api()
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .expect(500);

    expect(response.body.code).toBe('PROFILE_DATA_INVALID');
    expect(JSON.stringify(response.body)).not.toContain('corrupt-value');
  });

  it('allows account recovery reads but blocks mutations until verification', async () => {
    const bootstrapResponse = await bootstrap('unverified-a').expect(201);

    expect(bootstrapResponse.body.emailVerified).toBe(false);

    const readableProfile = await api()
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer unverified-a')
      .expect(200);

    expect(readableProfile.body).toMatchObject({
      userId: userA,
      emailVerified: false,
      version: 1,
    });

    const unverifiedResponse = await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer unverified-a')
      .send({
        expectedVersion: 1,
        displayName: 'Blocked update',
      })
      .expect(403);

    expect(unverifiedResponse.body.code).toBe('EMAIL_VERIFICATION_REQUIRED');
    expect(unverifiedResponse.headers['www-authenticate']).toBeUndefined();

    await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer verified-without-email')
      .send({
        expectedVersion: 1,
        displayName: 'Also blocked',
      })
      .expect(403);

    const unchanged = await firestore.collection('users').doc(userA).get();

    expect(unchanged.get('version')).toBe(1);
    expect(unchanged.get('displayName')).toBeNull();
    expect((await auditEntries(userA)).size).toBe(1);

    const verifiedResponse = await api()
      .patch('/api/v1/users/me')
      .set('Authorization', 'Bearer actor-a')
      .send({
        expectedVersion: 1,
        displayName: 'Allowed update',
      })
      .expect(200);

    expect(verifiedResponse.body).toMatchObject({
      displayName: 'Allowed update',
      emailVerified: true,
      version: 2,
    });

    expect((await auditEntries(userA)).size).toBe(2);
  });
});
