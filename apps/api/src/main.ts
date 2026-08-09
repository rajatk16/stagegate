import helmet from 'helmet';
import { Server } from 'http';
import { Logger } from 'nestjs-pino';
import compression from 'compression';
import { json, urlencoded } from 'express';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface';

import { AppModule } from '@/app.module';
import { ValidationException } from '@/common/utils';
import { setupSwagger } from '@/swagger/swagger.config';
import { GlobalExceptionFilter } from '@/common/filters';
import { ResponseInterceptor } from '@/common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  const nodeEnv = configService.getOrThrow<string>('app.nodeEnv');
  const corsOrigins = configService.getOrThrow<string[]>('app.corsOrigins');
  const port = configService.getOrThrow<number>('app.port');

  const requestTimeoutMs = configService.getOrThrow<number>(
    'app.requestTimeoutMs',
  );
  const headersTimeoutMs = configService.getOrThrow<number>(
    'app.headersTimeoutMs',
  );

  app.use(
    helmet({
      contentSecurityPolicy:
        nodeEnv === 'production'
          ? {
              directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                objectSrc: ["'none"],
                frameAncestors: ["'none'"],
                formAction: ["'self'"],
                imgSrc: ["'self'", 'data:'],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                connectSrc: ["'self'"],
              },
            }
          : false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'same-site',
      },
      referrerPolicy: {
        policy: 'no-referrer',
      },
    }),
  );

  app.use(compression());

  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  const customOrigin: CustomOrigin = (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin is not allowed'), false);
  };

  app.enableCors({
    credentials: false,
    origin: customOrigin,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86_400,
  });

  app.setGlobalPrefix('v1');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => new ValidationException(errors),
    }),
  );

  app.useLogger(logger);

  app.useGlobalFilters(app.get(GlobalExceptionFilter));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const swaggerEnabled =
    configService.getOrThrow<boolean>('app.swaggerEnabled');

  if (swaggerEnabled) {
    setupSwagger(app);
  }

  const server = app.getHttpServer() as Server;

  server.requestTimeout = requestTimeoutMs;
  server.headersTimeout = headersTimeoutMs;

  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error('Application bootstrap failed');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
