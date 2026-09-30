import { Module } from '@nestjs/common';

import { FirebaseModule } from '../firebase';
import { ReadinessService } from './services';
import { HealthController } from './controllers';

@Module({
  imports: [FirebaseModule],
  providers: [ReadinessService],
  controllers: [HealthController],
})
export class HealthModule {}
