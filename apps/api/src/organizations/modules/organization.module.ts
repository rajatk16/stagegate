import { Module, forwardRef } from '@nestjs/common';

import { UsersModule } from '../../users/modules/user.module';
import { OrganizationsController } from '../controllers';
import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { InvitationsModule } from '../../invitations/modules/invitations.module';
import {
  OrganizationsService,
  OrganizationLogoService,
  OrganizationAccessService,
  OrganizationMembersService,
} from '../services';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationmembershipRepository,
} from '../repositories';

@Module({
  controllers: [OrganizationsController],
  imports: [
    FirebaseModule,
    AuditModule,
    UsersModule,
    forwardRef(() => InvitationsModule),
  ],
  exports: [
    OrganizationRepository,
    OrganizationAccessService,
    OrganizationmembershipRepository,
  ],
  providers: [
    OrganizationsService,
    OrganizationRepository,
    OrganizationLogoService,
    OrganizationAccessService,
    OrganizationMembersService,
    OrganizationSlugRepository,
    OrganizationmembershipRepository,
  ],
})
export class OrganizationModule {}
