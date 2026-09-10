import { Module } from '@nestjs/common';

import { TenancyExceptionFilter } from '../filters';
import { MembershipsController, OrganizationsControllers } from '../controllers';
import { MembershipService, OrganizationPolicyService, OrganizationService } from '../services';
import {
  MembershipRepository,
  OrganizationRepository,
  FirestoreMembershipRepository,
  FirestoreOrganizationRepository,
} from '../repositories';

@Module({
  controllers: [MembershipsController, OrganizationsControllers],
  exports: [
    MembershipService,
    OrganizationService,
    MembershipRepository,
    OrganizationPolicyService,
  ],
  providers: [
    MembershipService,
    OrganizationService,
    TenancyExceptionFilter,
    OrganizationPolicyService,
    {
      provide: MembershipRepository,
      useClass: FirestoreMembershipRepository,
    },
    {
      provide: OrganizationRepository,
      useClass: FirestoreOrganizationRepository,
    },
  ],
})
export class TenancyModule {}
