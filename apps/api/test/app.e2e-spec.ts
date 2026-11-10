import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Health endpoint', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('returns the health payload as JSON on the versioned route', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect('Content-Type', /application\/json/)
      .expect({ status: 'ok' });
  });

  it('returns 404 for the unprefixed health route', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });
});
