import request from 'supertest';
import type { App as HttpApp } from 'supertest/types';
import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import type { App as FirebaseApp } from 'firebase-admin/app';
import { describe, it, expect, afterAll, beforeAll } from '@jest/globals';

import { FIREBASE_APP } from '@stagegate/backend-platform';

import { AppModule } from '../src/app.module';
import { configureApplication } from '../src/configureApplication';

describe('API application', () => {
  let app: INestApplication<HttpApp>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    configureApplication(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('initializes the Firebase Admin', () => {
    const firebaseApp = app.get<FirebaseApp>(FIREBASE_APP);

    expect(firebaseApp.name).toBe('stagegate-api');
    expect(firebaseApp.options.projectId).toBe('stagegate-test');
  });

  it('serves the versioned API root', async () => {
    await request(app.getHttpServer()).get('/api/v1').expect(200).expect({
      service: 'stagegate-api',
      status: 'running',
    });
  });
});
