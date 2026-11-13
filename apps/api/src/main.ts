import { Logger, ShutdownSignal } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AppConfigService } from './config/services/appConfig.service';
import { configureApp } from './configureApp';

import type { NestExpressApplication } from '@nestjs/platform-express';

const bootstrap = async () => {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
    bodyParser: false,
  });

  try {
    const config = app.get(AppConfigService);

    configureApp(app);

    app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

    const host = config.get('HOST');
    const port = config.get('PORT');

    await app.listen(port, host);

    logger.log(`StageGate API listening on ${host}:${String(port)}`);
    logger.log(`Environment: ${config.get('NODE_ENV')}`);

    logger.log('Business API prefix: /api/v1');

    if (config.get('SWAGGER_ENABLED')) {
      logger.log('Swagger documentation available at /docs');
    }
  } catch (error) {
    await app.close();
    throw error;
  }
};

void bootstrap().catch(() => {
  const logger = new Logger('Bootstrap');

  logger.error('StageGate API failed to start. Check configuration and initialization.');

  process.exitCode = 1;
});
