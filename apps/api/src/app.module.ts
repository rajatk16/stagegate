import { Module } from '@nestjs/common';
import { FirebaseAdminModule, RuntimeConfigModule } from '@stagegate/backend-platform';

import { AppController } from './app.controller';

@Module({
  imports: [
    RuntimeConfigModule.forRoot({
      serviceName: 'stagegate-api',
      defaultPort: 3000,
      envFilePaths: ['.env.local', '.env'],
    }),
    FirebaseAdminModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
