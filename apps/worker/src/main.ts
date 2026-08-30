import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  RuntimeConfigService,
  ConfigurationValidationError,
} from '@stagegate/backend-platform';

import { WorkerModule } from './worker.module';
import { configureApplication } from './configureApplication';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerModule);
  const config = app.get(RuntimeConfigService);

  configureApplication(app);

  await app.listen(config.port, '0.0.0.0');
  logger.log(`Worker listening on port ${config.port}`);
}

bootstrap().catch((error: unknown) => {
  if (error instanceof ConfigurationValidationError) {
    logger.error(error.message);
  } else {
    logger.error('Worker failed to start.');
  }
  process.exitCode = 1;
});
