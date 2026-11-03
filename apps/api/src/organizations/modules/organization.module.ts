import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules/audit.module';
import { UsersModule } from '../../users/modules/users.module';
import { FirebaseModule } from '../../firebase/module/firebase.module';
import { OrganizationsController } from '../controllers/organizations.controller';
import { InvitationsModule } from '../../invitations/modules/invitations.module';
import { OrganizationPersistenceModule } from './organizationPersistence.module';
import { OrganizationAccessService } from '../services/organizationAccess.service';
import { OrganizationsService } from '../services/organizations.service';
import { OrganizationLogoService } from '../services/organizationLogo.service';
import { OrganizationMembersService } from '../services/organizationMembers.service';

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
