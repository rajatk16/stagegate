import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AuthenticationExceptionFilter } from '../filters';
import { FirebaseTokenGuard, VerifiedEmailGuard } from '../guards';
import { AuthenticationAuditWriter, StructuredAuthenticationAuditWriter } from '../services';

@Module({
  providers: [
    {
      provide: AuthenticationAuditWriter,
      useClass: StructuredAuthenticationAuditWriter,
    },
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
