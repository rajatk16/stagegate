import { Module } from '@nestjs/common';

import { FirebaseModule } from '../../firebase/modules/firebase.module';
import { IdentityModule } from '../../identity/modules/identity.module';
import { OrganizationsService } from '../services/organizations.service';
import { OrganizationsController } from '../controllers/organizations.controller';
import { OrganizationsRepository } from '../repositories/organizations.repository';
import { OrganizationSlugRepository } from '../repositories/organizationSlug.repository';
import { OrganizationMembershipRepository } from '../repositories/organizationMembership.repository';

@Module({
  controllers: [OrganizationsController],
  imports: [FirebaseModule, IdentityModule],
  providers: [
    OrganizationsService,
    OrganizationsRepository,
    OrganizationSlugRepository,
    OrganizationMembershipRepository,
  ],
})
export class OrganizationsModule {}
