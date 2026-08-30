import { type INestApplication } from '@nestjs/common';

export const configureApplication = (app: INestApplication): void => {
  app.setGlobalPrefix('internal/v1');
  app.enableShutdownHooks();
};
