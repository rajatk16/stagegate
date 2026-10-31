import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules';
import { FirebaseModule } from '../../firebase/module';
import { EventAccessModule } from './eventAccess.module';
import { EventsService } from '../services/events.service';
import { EventsRepository } from '../repositories/events.repository';
import { EventSlugsRepository } from '../repositories/eventSlugs.repository';
import { EventMembersService } from '../services/eventMembers.service';
import { EventsController, EventMembersController } from '../controllers';
import { OrganizationPersistenceModule } from '../../organizations/modules/organizationPersistence.module';

@Module({
  controllers: [EventsController, EventMembersController],
  providers: [
    EventsService,
    EventsRepository,
    EventMembersService,
    EventSlugsRepository,
  ],
  imports: [
    AuditModule,
    FirebaseModule,
    EventAccessModule,
    OrganizationPersistenceModule,
  ],
})
export class EventsModule {}
