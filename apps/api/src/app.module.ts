import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import appConfig from '@/config/app.config';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { LoggerModule } from '@/logger/logger.module';
import { HealthModule } from '@/health/health.module';
import { CommonModule } from '@/common/common.module';
import firebaseConfig from '@/config/firebase.config';
import { FirebaseModule } from '@/firebase/firebase.module';
import { validateEnvironment } from '@/config/env.validation';
import { FirebaseAuthGuard } from '@/auth/guards/firebaseAuth.guard';
import { AuthorizationModule } from '@/authorization/authorization.module';
import { OrganizationsModule } from '@/organizations/organizations.module';
import { AuthorizationGuard } from '@/authorization/guards/authorization.guard';
import {
  OrganizationContextGuard,
  OrganizationWritableGuard,
} from '@/organizations/guards';

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
    LoggerModule,
    CommonModule,
    FirebaseModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AuthorizationModule,
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
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
