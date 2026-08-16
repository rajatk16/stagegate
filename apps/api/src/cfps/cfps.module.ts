import { Module } from '@nestjs/common';

import { EventsModule } from '@/events';
import { OrganizationsModule } from '@/organizations';

import { CfpsController } from './controllers';
import { CfpRepository } from './repositories';
import { CfpDomainService, CfpApplicationService } from './services';

@Module({
  controllers: [CfpsController],
  imports: [EventsModule, OrganizationsModule],
  exports: [CfpDomainService, CfpRepository, CfpApplicationService],
  providers: [CfpDomainService, CfpRepository, CfpApplicationService],
})
export class CfpsModule {}
