import { Module } from '@nestjs/common';

import { AuditModule } from '../../audit/modules';
import { UsersModule } from '../../users/modules';
import { FirebaseModule } from '../../firebase/module';
import { OrganizationsController } from '../controllers';
import { InvitationsModule } from '../../invitations/modules';
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
