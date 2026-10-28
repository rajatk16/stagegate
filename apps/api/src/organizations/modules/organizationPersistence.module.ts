import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules';
import { FirebaseModule } from '../../firebase/module';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationMembershipRepository,
} from '../repositories';

@Module({
  imports: [AuditModule, FirebaseModule],
  providers: [
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipRepository,
  ],
  exports: [
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipRepository,
  ],
})
export class OrganizationPersistenceModule {}
