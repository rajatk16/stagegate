import { Module } from '@nestjs/common';

import { OrganizationsController } from './controllers';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationMembershipRepository,
} from './repositories';
import {
  OrganizationService,
  OrganizationsService,
  OrganizationMembershipService,
  OrganizationApplicationService,
} from './services';

@Module({
  exports: [
    OrganizationService,
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationMembershipRepository,
  ],
  providers: [
    OrganizationService,
    OrganizationsService,
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationMembershipRepository,
    OrganizationMembershipService,
  ],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
