import { Module } from '@nestjs/common';

import { UsersModule } from '@/users/users.module';

import { OrganizationContextGuard } from './guards';
import { OrganizationsController } from './controllers';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationMembershipRepository,
} from './repositories';
import {
  OrganizationService,
  OrganizationsService,
  OrganizationDomainService,
  OrganizationContextService,
  OrganizationMembershipService,
  OrganizationApplicationService,
} from './services';

@Module({
  imports: [UsersModule],
  controllers: [OrganizationsController],
  exports: [
    OrganizationService,
    OrganizationRepository,
    OrganizationContextGuard,
    OrganizationContextService,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationMembershipRepository,
  ],
  providers: [
    OrganizationService,
    OrganizationsService,
    OrganizationRepository,
    OrganizationContextGuard,
    OrganizationDomainService,
    OrganizationSlugRepository,
    OrganizationContextService,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationMembershipRepository,
  ],
})
export class OrganizationsModule {}
