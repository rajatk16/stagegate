import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';

import { validateEnvironment } from './config';
import { ApiExceptionFilter } from './common/filters';
import { toValidationIssues } from './common/mappers';
import { AuthModule } from './auth/modules/auth.module';
import { UsersModule } from './users/modules/user.module';
import { HealthModule } from './health/modules/firebase.module';
import { RequestValidationException } from './common/exceptions';
import { FirebaseModule } from './firebase/module/firebase.module';
import { InvitationsModule } from './invitations/modules/invitations.module';
import { OrganizationModule } from './organizations/modules/organization.module';
import { ObservabilityModule } from './observalibility/modules/observability.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    AuthModule,
    UsersModule,
    HealthModule,
    FirebaseModule,
    InvitationsModule,
    OrganizationModule,
    ObservabilityModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          transformOptions: {
            enableImplicitConversion: false,
          },
          validationError: {
            target: false,
            value: false,
          },
          exceptionFactory: (errors) =>
            new RequestValidationException(toValidationIssues(errors)),
        }),
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
  ],
})
export class AppModule {}
