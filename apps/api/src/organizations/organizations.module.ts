import { Module } from '@nestjs/common';

import { UsersModule } from '@/users/users.module';

import { OrganizationContextGuard } from './guards';
import {
  OrganizationsController,
  OrganizationInvitationsController,
} from './controllers';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationMembershipRepository,
  OrganizationMembershipInvitationRepository,
} from './repositories';
import {
  OrganizationService,
  OrganizationsService,
  OrganizationDomainService,
  OrganizationContextService,
  OrganizationMembershipService,
  OrganizationApplicationService,
  OrganizationMembershipInvitationService,
} from './services';

@Module({
  imports: [UsersModule],
  controllers: [OrganizationsController, OrganizationInvitationsController],
  exports: [
    OrganizationService,
    OrganizationRepository,
    OrganizationContextGuard,
    OrganizationContextService,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationMembershipInvitationService,
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
    OrganizationMembershipInvitationService,
    OrganizationMembershipInvitationRepository,
  ],
})
export class OrganizationsModule {}
