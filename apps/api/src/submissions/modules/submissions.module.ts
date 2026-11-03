import { Module } from '@nestjs/common';

import { CommonModule } from '../../common/modules/common.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { EventAccessModule } from '../../events/modules/eventAccess.module';
import { EventSubmissionWindowService } from '../services/eventSubmissionWindow.service';

@Module({
  imports: [CommonModule, FirebaseModule, EventAccessModule],
  exports: [EventSubmissionWindowService],
  providers: [EventSubmissionWindowService],
})
export class SubmissionsModule {}
