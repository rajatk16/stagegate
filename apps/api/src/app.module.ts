import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CfpsModule } from '@/cfps';
import { UsersModule } from '@/users';
import { EventsModule } from '@/events';
import { HealthModule } from '@/health';
import { LoggerModule } from '@/logger';
import { PublicModule } from '@/public';
import { FirebaseModule } from '@/firebase';
import { SubmissionsModule } from '@/submissions';
import { CommonModule, ThrottlerBehindProxyGuard } from '@/common';
import { EventContextGuard, EventWritableGuard } from './events/guards';
import { appConfig, firebaseConfig, validateEnvironment } from '@/config';
import { AuthModule, FirebaseAuthGuard, AuthorizationGuard } from '@/auth';
import {
  OrganizationsModule,
  OrganizationContextGuard,
  OrganizationWritableGuard,
} from '@/organizations';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnvironment,
      load: [firebaseConfig, appConfig],
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.getOrThrow<number>('app.rateLimit.ttlMs'),
            limit: configService.getOrThrow<number>('app.rateLimit.limit'),
          },
        ],
        errorMessage: 'Too many requests. Please try again later.',
      }),
    }),
    AuthModule,
    CfpsModule,
    UsersModule,
    CommonModule,
    EventsModule,
    HealthModule,
    LoggerModule,
    PublicModule,
    FirebaseModule,
    SubmissionsModule,
    OrganizationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationContextGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationWritableGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EventContextGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EventWritableGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
