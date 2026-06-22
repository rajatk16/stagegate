import { Module } from '@nestjs/common';

import { OrganizationRepository } from './repositories';

@Module({
  exports: [OrganizationRepository],
  providers: [OrganizationRepository],
})
export class OrganizationsModule {}
