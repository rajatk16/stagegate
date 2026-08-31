import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { FirebaseTokenGuard } from '../guards';
import { AuthenticationExceptionFilter } from '../filters';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: FirebaseTokenGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AuthenticationExceptionFilter,
    },
  ],
})
export class AuthModule {}
