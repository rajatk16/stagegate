import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { EventAccessModule } from './eventAccess.module';
import { EventsService } from '../services/events.service';
import { EventsRepository } from '../repositories/events.repository';
import { EventSlugsRepository } from '../repositories/eventSlugs.repository';
import { EventMembersService } from '../services/eventMembers.service';
import { EventMembersController } from '../controllers/eventMembers.controller';
import { OrganizationPersistenceModule } from '../../organizations/modules/organizationPersistence.module';
import { EventsController } from '../controllers/events.controller';
import { CommonModule } from '../../common/modules/common.module';

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
    CommonModule,
    FirebaseModule,
    EventAccessModule,
    OrganizationPersistenceModule,
  ],
})
export class EventsModule {}
