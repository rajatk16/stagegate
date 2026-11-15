import { Module } from '@nestjs/common';

import { FirebaseModule } from '../../firebase/modules/firebase.module';
import { HealthController } from '../controllers/health.controller';
import { HealthService } from '../services/health.service';

@Module({
  imports: [FirebaseModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
