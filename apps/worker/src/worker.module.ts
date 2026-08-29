import { Module } from '@nestjs/common';
import {
  FirebaseAdminModule,
  RuntimeConfigModule,
} from '@stagegate/backend-platform';

import { WorkerController } from './worker.controller';

@Module({
  imports: [
    RuntimeConfigModule.forRoot({
      serviceName: 'stagegate-worker',
      defaultPort: 3001,
      envFilePaths: ['.env.local', '.env'],
    }),
    FirebaseAdminModule,
  ],
  controllers: [WorkerController],
})
export class WorkerModule {}
