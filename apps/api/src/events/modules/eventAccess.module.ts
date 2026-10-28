import { Module } from '@nestjs/common';

import { FirebaseModule } from '../../firebase/module';
import { EventAccessService } from '../services/eventAccess.service';
import { EventMembershipRepository } from '../repositories/eventMembership.repository';
import { OrganizationPersistenceModule } from '../../organizations/modules/organizationPersistence.module';

@Module({
  imports: [FirebaseModule, OrganizationPersistenceModule],
  providers: [EventAccessService, EventMembershipRepository],
  exports: [EventAccessService, EventMembershipRepository],
})
export class EventAccessModule {}
