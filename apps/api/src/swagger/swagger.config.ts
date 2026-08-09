import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Application, NextFunction, Request, Response } from 'express';

type SwaggerOptions = {
  username?: string;
  password?: string;
};

const swaggerBasicAuth = (username?: string, password?: string) => {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!username || !password) {
      return next();
    }

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Basic ')) {
      response.setHeader('WWW-Authenticate', 'Basic realm="StageGate API"');
      response.status(401).send('Unauthorized');
      return;
    }

    const [providedUsername, providedPassword] = Buffer.from(
      authorization.slice('Basic '.length),
      'base64',
    )
      .toString('utf-8')
      .split(':', 2);

    if (providedUsername !== username || providedPassword !== password) {
      response.setHeader('WWW-Authenticate', 'Basic realm="StageGate API"');
      response.status(401).send('Unauthorized');
      return;
    }

    return next();
  };
};

export const setupSwagger = (
  app: INestApplication,
  options: SwaggerOptions = {},
) => {
  const config = new DocumentBuilder()
    .setTitle('StageGate API')
    .setDescription('CFP Review Platform API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'firebase-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const expressApp = app.getHttpAdapter().getInstance() as Application;

  expressApp.use(
    ['/v1/docs', '/v1/docs-json', '/v1/docs-yaml'],
    swaggerBasicAuth(options.username, options.password),
  );

  SwaggerModule.setup('v1/docs', app, document, {
    ui: true,
    raw: ['json'],
    jsonDocumentUrl: '/v1/docs-json',
    yamlDocumentUrl: '/v1/docs-yaml',
  });
};
