import { Module } from '@nestjs/common';

import { CfpsModule } from '@/cfps';
import { EventsModule } from '@/events';
import { OrganizationsModule } from '@/organizations';

import { PublicEventsController } from './controllers';
import {
  PublicEventApplicationService,
  PublicVisibilityPolicyService,
} from './services';

@Module({
  controllers: [PublicEventsController],
  imports: [EventsModule, CfpsModule, OrganizationsModule],
  exports: [PublicEventApplicationService, PublicVisibilityPolicyService],
  providers: [PublicEventApplicationService, PublicVisibilityPolicyService],
})
export class PublicModule {}
