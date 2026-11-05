import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { Module, ValidationPipe } from '@nestjs/common';

import { AuthModule } from './auth/modules/auth.module';
import { UsersModule } from './users/modules/users.module';
import { validateEnvironment } from './config/environment';
import { EventsModule } from './events/modules/events.module';
import { HealthModule } from './health/modules/health.module';
import { FirebaseModule } from './firebase/module/firebase.module';
import { ApiExceptionFilter } from './common/filters/apiException.filter';
import { toValidationIssues } from './common/mappers/validationError.mapper';
import { InvitationsModule } from './invitations/modules/invitations.module';
import { SubmissionsModule } from './submissions/modules/submissions.module';
import { OrganizationModule } from './organizations/modules/organization.module';
import { ObservabilityModule } from './observalibility/modules/observability.module';
import { RequestValidationException } from './common/exceptions/requestValidation.exception';
import { EventConfigurationModule } from './events/modules/eventConfiguration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    AuthModule,
    UsersModule,
    EventsModule,
    HealthModule,
    FirebaseModule,
    InvitationsModule,
    SubmissionsModule,
    OrganizationModule,
    ObservabilityModule,
    EventConfigurationModule,
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
