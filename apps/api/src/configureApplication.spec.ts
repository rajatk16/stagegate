import type { INestApplication } from '@nestjs/common';
import { describe, expect, it, jest } from '@jest/globals';

import { configureApplication } from './configureApplication';

describe('configureApplication', () => {
  it('sets the API prefix and enables shutdown hooks', () => {
    const app = {
      setGlobalPrefix: jest.fn<INestApplication['setGlobalPrefix']>(),
      enableShutdownHooks: jest.fn<INestApplication['enableShutdownHooks']>(),
    } as Pick<INestApplication, 'enableShutdownHooks' | 'setGlobalPrefix'>;

    configureApplication(app as INestApplication);

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api/v1');
    expect(app.enableShutdownHooks).toHaveBeenCalledWith();
  });
});
