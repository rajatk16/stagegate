import { Module } from '@nestjs/common';

import { UsersModule } from '@/users';
import { FirebaseModule } from '@/firebase';
import { OrganizationsModule } from '@/organizations';

import { EventsController } from './controllers';
import { EventContextGuard, EventWritableGuard } from './guards';
import {
  EventRepository,
  EventSlugRepository,
  EventMembershipRepository,
} from './repositories';
import {
  EventsService,
  EventsDomainService,
  EventMembershipService,
  EventApplicationService,
  EventMembershipPolicyService,
} from './services';

@Module({
  controllers: [EventsController],
  imports: [FirebaseModule, OrganizationsModule, UsersModule],
  exports: [
    EventsService,
    EventRepository,
    EventContextGuard,
    EventWritableGuard,
    EventsDomainService,
    EventSlugRepository,
    EventMembershipService,
    EventApplicationService,
    EventMembershipRepository,
    EventMembershipPolicyService,
  ],
  providers: [
    EventsService,
    EventRepository,
    EventContextGuard,
    EventWritableGuard,
    EventsDomainService,
    EventSlugRepository,
    EventMembershipService,
    EventApplicationService,
    EventMembershipRepository,
    EventMembershipPolicyService,
  ],
})
export class EventsModule {}
