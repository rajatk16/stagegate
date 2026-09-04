import { Module } from '@nestjs/common';

import { TenancyExceptionFilter } from '../filters';
import { MembershipService, OrganizationService } from '../services';
import { MembershipsController, OrganizationsControllers } from '../controllers';
import {
  MembershipRepository,
  OrganizationRepository,
  FirestoreMembershipRepository,
  FirestoreOrganizationRepository,
} from '../repositories';

@Module({
  controllers: [MembershipsController, OrganizationsControllers],
  exports: [OrganizationService, MembershipService, MembershipRepository],
  providers: [
    MembershipService,
    OrganizationService,
    TenancyExceptionFilter,
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
