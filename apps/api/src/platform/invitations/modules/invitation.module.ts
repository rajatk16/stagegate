import { Module } from '@nestjs/common';

import { TenancyModule } from '../../tenancy';
import { InvitationService } from '../services';
import { InvitationRepository } from '../repositories';
import {
  InvitationsController,
  OrganizationInvitationsController,
} from '../controllers';

@Module({
  imports: [TenancyModule],
  providers: [InvitationService, InvitationRepository],
  controllers: [InvitationsController, OrganizationInvitationsController],
})
export class InvitationModule {}
