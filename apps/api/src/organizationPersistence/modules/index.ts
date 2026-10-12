import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationmembershipRepository,
} from '../../organizations/repositories';

@Module({
  imports: [AuditModule, FirebaseModule],
  providers: [
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationmembershipRepository,
  ],
  exports: [
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationmembershipRepository,
  ],
})
export class OrganizationPersistenceModule {}
