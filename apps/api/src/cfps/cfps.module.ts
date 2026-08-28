import { Module } from '@nestjs/common';

import { EventsModule } from '@/events';
import { OrganizationsModule } from '@/organizations';

import { CfpsController } from './controllers';
import { CfpRepository } from './repositories';
import { CfpDomainService, CfpApplicationService } from './services';

@Module({
  exports: [CfpRepository],
  controllers: [CfpsController],
  imports: [EventsModule, OrganizationsModule],
  providers: [CfpDomainService, CfpRepository, CfpApplicationService],
})
export class CfpsModule {}
