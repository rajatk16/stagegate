import { Module } from '@nestjs/common';
import { FirebaseAdminModule, RuntimeConfigModule } from '@stagegate/backend-platform';

import { AuthModule } from './platform/auth';
import { AppController } from './app.controller';
import { IdentityModule } from './platform/identity';
import { TenancyModule } from './platform/tenancy/modules';

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
    FirebaseAdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
