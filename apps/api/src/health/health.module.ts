import { Module } from '@nestjs/common';

import { FirebaseModule } from '@/firebase/firebase.module';

import { HealthService } from './services';
import { HealthController } from './controllers';

@Module({
  imports: [FirebaseModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
