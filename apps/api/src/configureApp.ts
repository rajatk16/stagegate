import { RequestMethod, VersioningType } from '@nestjs/common';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { RequestContextMiddleware } from './common/middlewares/requestContext.middleware';
import { createValidationPipe } from './common/validation/validation.pipe';
import { AppConfigService } from './config/services/appConfig.service';
import { configureSwagger } from './swagger/configs/swagger.config';

import type { NestExpressApplication } from '@nestjs/platform-express';

export const configureApp = (app: NestExpressApplication): void => {
  const config = app.get(AppConfigService);

  const requestContext = app.get(RequestContextMiddleware);

  app.disable('x-powered-by');

  app.set('trust proxy', false);

  app.use(requestContext.use.bind(requestContext));

  app.use(
    helmet({
      ...(config.get('SWAGGER_ENABLED') ? { contentSecurityPolicy: false as const } : {}),

      ...(!config.isProduction ? { strictTransportSecurity: false as const } : {}),
    }),
  );

  app.enableCors({
    origin: config.get('CORS_ORIGINS'),

    credentials: config.get('CORS_CREDENTIALS'),

    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],

    exposedHeaders: ['X-Request-Id'],

    maxAge: 600,
  });

  app.use(
    json({
      limit: config.get('HTTP_BODY_LIMIT'),
    }),
  );

  app.use(
    urlencoded({
      extended: false,
      limit: config.get('HTTP_BODY_LIMIT'),
      parameterLimit: 100,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: [
      {
        path: 'health/live',
        method: RequestMethod.GET,
      },
      {
        path: 'health/ready',
        method: RequestMethod.GET,
      },
    ],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(createValidationPipe());

  configureSwagger(app, config);
};
