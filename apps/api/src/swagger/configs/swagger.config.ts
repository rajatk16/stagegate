import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ApiErrorResponseDto } from '../../common/dtos/apiResponse.dto';

import type { AppConfigService } from '../../config/services/appConfig.service';
import type { INestApplication } from '@nestjs/common';

export const configureSwagger = (app: INestApplication, config: AppConfigService): void => {
  if (!config.get('SWAGGER_ENABLED')) {
    return;
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get('APP_NAME'))
    .setDescription(
      'StageGate API for conference organizations, ' +
        'events, CFPs, proposals and reviewer workflows.',
    )
    .setVersion(config.get('APP_VERSION'))
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,

    extraModels: [ApiErrorResponseDto],

    operationIdFactory: (controllerKey, methodKey) => `${controllerKey}_${methodKey}`,
  });

  SwaggerModule.setup('docs', app, document, {
    jsonDocumentUrl: '/docs/openapi.json',

    raw: ['json'],

    customSiteTitle: 'StageGate API Documentation',

    swaggerOptions: {
      persistAuthorization: false,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: false,
    },
  });
};
