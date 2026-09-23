import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { Environment } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableShutdownHooks();
  
  const config = app.get<ConfigService<Environment, true>>(ConfigService);

  const port = config.getOrThrow('PORT', { infer: true });
  const frontendOrigin = config.getOrThrow('FRONTEND_ORIGIN', {
    infer: true,
  });

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: frontendOrigin,
    exposedHeaders: ['Retry-After']
  });

  await app.listen(port);

  Logger.log(`Health endpoint: http://localhost:${port}/api/v1/health`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start the API: ', error);
  process.exitCode = 1;
});
