import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/modules/common.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { EventAccessModule } from '../../events/modules/eventAccess.module';
import { SubmissionController } from '../controllers/submissions.controller';
import { EventSubmissionWindowService } from '../services/eventSubmissionWindow.service';
import { EventConfigurationModule } from '../../events/modules/eventConfiguration.module';

@Module({
  imports: [
    CommonModule,
    FirebaseModule,
    EventAccessModule,
    EventConfigurationModule,
  ],
  controllers: [SubmissionController],
  exports: [EventSubmissionWindowService],
  providers: [EventSubmissionWindowService],
})
export class SubmissionsModule {}
