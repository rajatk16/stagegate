import { Module } from '@nestjs/common';

import { EventAccessModule } from './eventAccess.module';
import { AuditModule } from '../../audit/modules/audit.module';
import { CommonModule } from '../../common/modules/common.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { EventConfigurationService } from '../services/eventConfiguration.service';
import { EventConfigurationController } from '../controllers/eventConfiguration.controller';
import { EventConfigurationRepository } from '../repositories/eventConfiguration.repository';
import { EventConfigurationReferencesService } from '../services/eventConfigurationReferences.service';

@Module({
  controllers: [EventConfigurationController],
  imports: [AuditModule, CommonModule, FirebaseModule, EventAccessModule],
  providers: [
    EventConfigurationService,
    EventConfigurationRepository,
    EventConfigurationReferencesService,
  ],
})
export class EventConfigurationModule {}
