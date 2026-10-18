import { Module } from '@nestjs/common';

import { ReadinessService } from '../services';
import { HealthController } from '../controllers';
import { FirebaseModule } from '../../firebase/module/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [ReadinessService],
  controllers: [HealthController],
})
export class HealthModule {}
