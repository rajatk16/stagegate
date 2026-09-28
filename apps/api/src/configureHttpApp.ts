import helmet from "helmet";
import { ConfigService } from "@nestjs/config";
import { INestApplication } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

import { Environment } from "./config/environment";
import { RequestLogginMiddleware } from "./observalibility";

export const configureHttpApp = (app: INestApplication): void => {
  const config = app.get<ConfigService<Environment, true>>(
    ConfigService
  );

  const requests = app.get(RequestLogginMiddleware);

  const production = config.getOrThrow('NODE_ENV', {
    infer: true
  }) === 'production';

  app.use(
    (
      request: Request,
      response: Response,
      next: NextFunction
    ) => requests.use(request, response, next)
  );

  app.use(
    helmet({
      strictTransportSecurity: production
        ? {
          maxAge: 31_536_000,
          includeSubDomains: false
        } : false,
      contentSecurityPolicy: {
        directives: {
          upgradeInsecureRequests: production ? [] : null
        }
      }
    })
  );

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: config.getOrThrow('FRONTEND_ORIGIN', {
      infer: true
    }),
    exposeHeaders: [
      'Retry-After',
      'X-Request-ID'
    ]
  });
}
