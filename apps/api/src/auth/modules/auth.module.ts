import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { EventScopedGuard } from '../../events/guards/eventScope.guard';
import { EventAccessModule } from '../../events/modules/eventAccess.module';
import { OrganizationModule } from '../../organizations/modules/organization.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import {
  SensitiveIpThrottleGuard,
  SensitiveUserThrottleGuard,
} from '../guards/sensitiveThrottle.guard';
import { FirebaseTokenGuard } from '../guards/firebaseToken.guard';
import { VerifiedEmailGuard } from '../guards/verifiedEmail.guard';
import { RecentAuthenticationGuard } from '../guards/recentAuthentication.guard';
import { OrganizationScopeGuard } from '../../organizations/guards/organizationScope.guard';
import { OrganizationPermissionGuard } from '../../organizations/guards/organizationPermission.guard';

@Module({
  imports: [
    FirebaseModule,
    EventAccessModule,
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
      useClass: RecentAuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationScopeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OrganizationPermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: EventScopedGuard,
    },
  ],
})
export class AuthModule {}
