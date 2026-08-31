import { describe, it, expect } from '@jest/globals';

import { AppController } from './app.controller';
import { PUBLIC_ROUTE_KEY, type AuthenticatedUser } from './platform/auth';

describe('AppController', () => {
  it('returns the API identity', () => {
    const controller = new AppController();

    expect(controller.getRoot()).toEqual({
      service: 'stagegate-api',
      status: 'running',
    });
  });

  it('marks the API identity route as public', () => {
    expect(
      Reflect.getMetadata(PUBLIC_ROUTE_KEY, AppController.prototype.getRoot),
    ).toBe(true);
  });

  it('returns the authenticated session actor', () => {
    const controller = new AppController();
    const actor: AuthenticatedUser = {
      uid: 'user-123',
      email: 'person@example.test',
      emailVerified: true,
      authTime: 1_700_000_000,
    };

    expect(controller.getSession(actor)).toBe(actor);
  });
});
