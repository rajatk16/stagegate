import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { WorkerModule } from './worker.module';

const logger = new Logger('Bootstrap');

function resolvePort(defaultPort: number): number {
  const configuredPort = process.env['PORT'];

  if (configuredPort === undefined) {
    return defaultPort;
  }

  const port = Number(configuredPort);

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return port;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WorkerModule);

  app.setGlobalPrefix('internal/v1');
  app.enableShutdownHooks();

  const port = resolvePort(3001);

  await app.listen(port, '0.0.0.0');
  logger.log(`Worker listening on port ${port}`);
}

bootstrap().catch(() => {
  logger.error('Worker failed to start.');
  process.exitCode = 1;
});
