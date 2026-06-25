import { Module } from '@nestjs/common';

import { OrganizationRepository } from './repositories';
import { OrganizationsService } from './organizations.service';
import { OrganizationSlugRepository } from './slugs/repositories';
import { OrganizationsController } from './organizations.controller';
import { OrganizationMembershipRepository } from './memberships/repositories';
import { OrganizationMembershipService } from './memberships/organizationMembership.service';

@Module({
  exports: [
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationMembershipRepository,
  ],
  providers: [
    OrganizationsService,
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationMembershipRepository,
  ],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
