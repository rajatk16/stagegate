import { NestFactory } from '@nestjs/core';
import { ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Environment } from './config';
import { AppModule } from './app.module';
import { SystemLogger } from './observalibility';
import { configureHttpApp } from './configureHttpApp';

const bootstrapLogger = new ConsoleLogger('Bootstrap', {
  json: true,
  colors: false
});


const bootstrap = async (): Promise<void> => {
  const app = await NestFactory.create(AppModule, {
    logger: new SystemLogger(),
    abortOnError: false
  });
  
  try {
    app.enableShutdownHooks();

    configureHttpApp(app);

    const config = app.get<ConfigService<Environment, true>>(ConfigService);
    
    const port = config.getOrThrow('PORT', {
      infer: true
    });

    await app.listen(port);

    bootstrapLogger.log({
      event: 'api.started',
      port
    });
  } catch (error: unknown) {
    await app.close();
    throw error;
  }
}

void bootstrap().catch(() => {
  bootstrapLogger.error({
    event: 'api.startup.failed'
  });
  process.exitCode = 1;
});
