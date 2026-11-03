import { Module } from '@nestjs/common';

import { ReadinessService } from '../services/readiness.service';
import { HealthController } from '../controllers/health.controller';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [ReadinessService],
  controllers: [HealthController],
})
export class HealthModule {}
