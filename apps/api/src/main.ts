import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const port = Number(config.get<string>('PORT') ?? 3000);
  const frontendOrigin = config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173';

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: frontendOrigin
  });

  await app.listen(port);

  Logger.log(`Health endpoint: http://localhost:${port}/api/v1/health`, 'Bootstrap');
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start the API: ', error);
  process.exitCode = 1;
});
