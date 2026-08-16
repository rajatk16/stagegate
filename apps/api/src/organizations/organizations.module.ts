import { Module } from '@nestjs/common';

import { UsersModule } from '@/users';

import { OrganizationContextGuard, OrganizationWritableGuard } from './guards';
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
  OrganizationLifecyclePolicyService,
  OrganizationAuthorizationPolicyService,
  OrganizationMembershipInvitationService,
} from './services';

@Module({
  imports: [UsersModule],
  controllers: [OrganizationsController, OrganizationInvitationsController],
  exports: [
    OrganizationService,
    OrganizationRepository,
    OrganizationContextGuard,
    OrganizationWritableGuard,
    OrganizationContextService,
    OrganizationSlugRepository,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationLifecyclePolicyService,
    OrganizationAuthorizationPolicyService,
    OrganizationMembershipInvitationService,
    OrganizationMembershipInvitationRepository,
  ],
  providers: [
    OrganizationService,
    OrganizationsService,
    OrganizationRepository,
    OrganizationContextGuard,
    OrganizationDomainService,
    OrganizationWritableGuard,
    OrganizationSlugRepository,
    OrganizationContextService,
    OrganizationMembershipService,
    OrganizationApplicationService,
    OrganizationMembershipRepository,
    OrganizationLifecyclePolicyService,
    OrganizationAuthorizationPolicyService,
    OrganizationMembershipInvitationService,
    OrganizationMembershipInvitationRepository,
  ],
})
export class OrganizationsModule {}
