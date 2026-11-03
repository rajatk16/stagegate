import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { OrganizationRepository } from '../repositories/organizations.repository';
import { OrganizationSlugRepository } from '../repositories/organizationSlugs.repository';
import { OrganizationMembershipRepository } from '../repositories/organizationMembership.repository';

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
