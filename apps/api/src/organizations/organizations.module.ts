import { Module } from '@nestjs/common';

import { OrganizationRepository } from './repositories';
import { OrganizationsService } from './organizations.service';
import { OrganizationSlugRepository } from './slugs/repositories';
import { OrganizationsController } from './organizations.controller';
import { OrganizationMembershipRepository } from './memberships/repositories';

@Module({
  exports: [
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipRepository,
  ],
  providers: [
    OrganizationsService,
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipRepository,
  ],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
