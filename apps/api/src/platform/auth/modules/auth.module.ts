import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AuthenticationExceptionFilter } from '../filters';
import { FirebaseTokenGuard, VerifiedEmailGuard } from '../guards';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseTokenGuard,
    },
    {
      provide: APP_GUARD,
      useClass: VerifiedEmailGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AuthenticationExceptionFilter,
    },
  ],
})
export class AuthModule {}
