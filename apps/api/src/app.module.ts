import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';

import { HealthModule } from './health';
import { environmentSchema } from './config';
import { ApiExceptionFilter } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: environmentSchema
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () => new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transformOptions: {
          enableImplicitConversion: false
        },
        validationError: {
          target: false,
          value: false
        }
      })
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter
    }
  ]
})
export class AppModule {}
