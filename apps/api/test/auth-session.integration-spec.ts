import { randomUUID } from 'node:crypto';

import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { deleteApp, type App as FirebaseApp } from 'firebase-admin/app';
import type { Auth } from 'firebase-admin/auth';
import request from 'supertest';
import type { App as HttpApp } from 'supertest/types';

import { FIREBASE_APP, FIREBASE_AUTH } from '@stagegate/backend-platform';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configureApplication';

interface EmulatorAccount {
  uid: string;
  idToken: string;
}

jest.setTimeout(45_000);

describe('Firebase authentication session lifecycle', () => {
  let app: INestApplication<HttpApp>;
  let firebaseApp: FirebaseApp;
  let auth: Auth;

  const createdUserIds: string[] = [];

  beforeAll(async () => {
    expect(process.env['APP_ENV']).toBe('test');
    expect(process.env['FIREBASE_PROJECT_ID']).toBe('stagegate-test');
    expect(process.env['FIREBASE_AUTH_EMULATOR_HOST']).toBe('127.0.0.1:9099');

    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    configureApplication(app);
    await app.init();

    firebaseApp = app.get<FirebaseApp>(FIREBASE_APP);
    auth = app.get<Auth>(FIREBASE_AUTH);
  });

  afterAll(async () => {
    try {
      await Promise.allSettled(
        createdUserIds.map((uid) => auth.deleteUser(uid)),
      );
    } finally {
      await app.close();
      await deleteApp(firebaseApp);
    }
  });

  async function createAccount(): Promise<EmulatorAccount> {
    const response = await fetch(
      'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=test-key',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `session-${randomUUID()}@example.test`,
          password: randomUUID(),
          returnSecureToken: true,
        }),
      },
    );

    expect(response.ok).toBe(true);

    const body: unknown = await response.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('localId' in body) ||
      typeof body.localId !== 'string' ||
      !('idToken' in body) ||
      typeof body.idToken !== 'string'
    ) {
      throw new Error('Auth Emulator returned an invalid response.');
    }

    createdUserIds.push(body.localId);

    return {
      uid: body.localId,
      idToken: body.idToken,
    };
  }

  async function advancePastTokenSecond(): Promise<void> {
    const milliseconds = 1_000 - (Date.now() % 1_000) + 100;

    await new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }

  it('rejects a token after refresh-token revocation', async () => {
    const account = await createAccount();

    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${account.idToken}`)
      .expect(200);

    // Firebase compares auth_time with tokensValidAfterTime at
    // second-level precision.
    await advancePastTokenSecond();
    await auth.revokeRefreshTokens(account.uid);

    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${account.idToken}`)
      .expect(401);

    expect(response.body).toMatchObject({
      code: 'AUTH_TOKEN_REVOKED',
      requestId: expect.any(String),
    });

    expect(JSON.stringify(response.body)).not.toContain(account.idToken);
  });

  it('rejects an existing token after the user is disabled', async () => {
    const account = await createAccount();

    await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${account.idToken}`)
      .expect(200);

    await auth.updateUser(account.uid, {
      disabled: true,
    });

    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/session')
      .set('Authorization', `Bearer ${account.idToken}`)
      .expect(401);

    expect(response.body).toMatchObject({
      code: 'AUTH_USER_DISABLED',
      requestId: expect.any(String),
    });

    expect(JSON.stringify(response.body)).not.toContain(account.idToken);
  });
});
