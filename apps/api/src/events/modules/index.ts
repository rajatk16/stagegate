import { Module } from '@nestjs/common';

import { EventsService } from '../services';
import { AuditModule } from '../../audit/modules';
import { FirebaseModule } from '../../firebase/module';
import { EventsController } from '../controllers/events.controller';
import { EventSlugsRepository, EventsRepository } from '../repositories';
import { OrganizationPersistenceModule } from '../../organizationPersistence/modules';

@Module({
  controllers: [EventsController],
  providers: [EventsRepository, EventSlugsRepository, EventsService],
  imports: [AuditModule, FirebaseModule, OrganizationPersistenceModule],
})
export class EventsModule {}
