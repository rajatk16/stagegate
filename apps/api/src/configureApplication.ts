import { type INestApplication } from '@nestjs/common';

export const configureApplication = (app: INestApplication): void => {
  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();
};
