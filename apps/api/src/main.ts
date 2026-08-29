import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  RuntimeConfigService,
  ConfigurationValidationError,
} from '@stagegate/backend-platform';

import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(RuntimeConfigService);

  app.setGlobalPrefix('api/v1');
  app.enableShutdownHooks();

  await app.listen(config.port, '0.0.0.0');
  logger.log(`API listening on port ${config.port}`);
}

bootstrap().catch((error: unknown) => {
  if (error instanceof ConfigurationValidationError) {
    logger.error(error.message);
  } else {
    logger.error('API failed to start.');
  }
  process.exitCode = 1;
});
