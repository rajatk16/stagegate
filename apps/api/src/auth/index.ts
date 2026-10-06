import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { FirebaseModule } from '../firebase';
import {
  OrganizationModule,
  OrganizationScopeGuard,
  OrganizationPermissionGuard,
} from '../organizations';
import {
  FirebaseTokenGuard,
  VerifiedEmailGuard,
  SensitiveIpThrottleGuard,
  SensitiveUserThrottleGuard,
} from './guards';

@Module({
  imports: [
    FirebaseModule,
    OrganizationModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'ip',
          limit: 120,
          ttl: 60_000,
          blockDuration: 60_000,
        },
        {
          name: 'user',
          limit: 5,
          ttl: 60_000,
          blockDuration: 60_000,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SensitiveIpThrottleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FirebaseTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: SensitiveUserThrottleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: VerifiedEmailGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationScopeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationPermissionGuard,
    },
  ],
})
export class AuthModule {}

export * from './types';
export * from './guards';
export * from './mappers';
export * from './policies';
export * from './constants';
export * from './decorators';
