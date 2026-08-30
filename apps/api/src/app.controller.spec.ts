import { describe, it, expect } from '@jest/globals';

import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns the API identity', () => {
    const controller = new AppController();

    expect(controller.getRoot()).toEqual({
      service: 'stagegate-api',
      status: 'running',
    });
  });
});
