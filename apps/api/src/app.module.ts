import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';

import { AuthModule } from './auth';
import { UsersModule } from './users';
import { HealthModule } from './health';
import { FirebaseModule } from './firebase';
import { validateEnvironment } from './config';
import { ObservabilityModule } from './observalibility';
import { ApiException, ApiExceptionFilter } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      ignoreEnvFile: process.env.NODE_ENV === 'production'
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    FirebaseModule,
    ObservabilityModule,
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
        },
        exceptionFactory: () => new ApiException(
          400,
          'VALIDATION_FAILED',
          'Request validation failed.'
        )
      })
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter
    }
  ]
})
export class AppModule {}
