import { Module } from '@nestjs/common';

import { FirebaseAdminModule, RuntimeConfigModule } from '@stagegate/backend-platform';

import { AuthModule } from './platform/auth';
import { TenancyModule } from './platform/tenancy';
import { IdentityModule } from './platform/identity';
import { InvitationModule } from './platform/invitations';

@Module({
  imports: [
    RuntimeConfigModule.forRoot({
      serviceName: 'stagegate-api',
      defaultPort: 3000,
      envFilePaths: ['.env.local', '.env'],
    }),
    AuthModule,
    TenancyModule,
    IdentityModule,
    InvitationModule,
    FirebaseAdminModule,
  ],
})
export class AppModule {}
