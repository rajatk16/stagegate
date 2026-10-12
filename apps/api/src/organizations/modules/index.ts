import { Module } from '@nestjs/common';

import { OrganizationsController } from '../controllers';
import { UsersModule } from '../../users/modules/user.module';
import { AuditModule } from '../../audit/modules/audit.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { InvitationsModule } from '../../invitations/modules/invitations.module';
import {
  OrganizationsService,
  OrganizationLogoService,
  OrganizationAccessService,
  OrganizationMembersService,
} from '../services';
import { OrganizationPersistenceModule } from '../../organizationPersistence/modules';

@Module({
  controllers: [OrganizationsController],
  exports: [OrganizationAccessService, OrganizationPersistenceModule],
  providers: [
    OrganizationsService,
    OrganizationLogoService,
    OrganizationAccessService,
    OrganizationMembersService,
  ],
  imports: [
    AuditModule,
    UsersModule,
    FirebaseModule,
    InvitationsModule,
    OrganizationPersistenceModule,
  ],
})
export class OrganizationModule {}
