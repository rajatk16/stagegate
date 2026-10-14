import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationMembershipRepository,
} from '../../organizations/repositories';

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
