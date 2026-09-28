import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment } from './config';
import { AppModule } from './app.module';
import { SystemLogger } from './observalibility';
import { configureHttpApp } from './configureHttpApp';
import { installGracefulShutdown } from './installGracefulShutdown';

const bootstrapLogger = new ConsoleLogger('Bootstrap', {
  json: true,
  colors: false,
});

const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, {
    logger: new SystemLogger(),
    abortOnError: false,
  });

  try {
    configureHttpApp(app);

    const config = app.get<ConfigService<Environment, true>>(ConfigService);

    const port = config.getOrThrow('PORT', {
      infer: true,
    });

    installGracefulShutdown(
      app,
      config.getOrThrow('SHUTDOWN_TIMEOUT_MS', {
        infer: true,
      }),
    );

    await app.listen(port, '0.0.0.0');
    bootstrapLogger.log({
      event: 'api.started',
      port,
    });
  } catch (error: unknown) {
    await app.close();
    throw error;
  }
};

void bootstrap().catch(() => {
  bootstrapLogger.error({
    event: 'api.startup.failed',
  });
  process.exitCode = 1;
});
