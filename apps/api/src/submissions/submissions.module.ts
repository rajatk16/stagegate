import { Module } from '@nestjs/common';

import { CfpsModule } from '@/cfps';
import { UsersModule } from '@/users';
import { EventsModule } from '@/events';
import { PublicModule } from '@/public';
import { OrganizationsModule } from '@/organizations';

import { SpeakerProfileRepository, ProposalRepository } from './repositories';
import {
  SpeakerProfilesController,
  SpeakerProposalsController,
} from './controllers';
import {
  ProposalDomainService,
  SpeakerProfileService,
  ProposalApplicationService,
  SpeakerContextResolverService,
} from './services';

@Module({
  controllers: [SpeakerProfilesController, SpeakerProposalsController],
  imports: [
    CfpsModule,
    UsersModule,
    EventsModule,
    PublicModule,
    OrganizationsModule,
  ],
  exports: [
    ProposalRepository,
    ProposalDomainService,
    SpeakerProfileService,
    SpeakerProfileRepository,
    ProposalApplicationService,
    SpeakerContextResolverService,
  ],
  providers: [
    ProposalRepository,
    ProposalDomainService,
    SpeakerProfileService,
    SpeakerProfileRepository,
    ProposalApplicationService,
    SpeakerContextResolverService,
  ],
})
export class SubmissionsModule {}
