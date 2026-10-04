import { Module } from '@nestjs/common';

import { AuditModule } from '../audit';
import { FirebaseModule } from '../firebase';
import { OrganizationsController } from './controllers';
import {
  OrganizationsService,
  OrganizationLogoService,
  OrganizationAccessService,
} from './services';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationmembershipRepository,
} from './repositories';

@Module({
  exports: [OrganizationAccessService],
  controllers: [OrganizationsController],
  imports: [FirebaseModule, AuditModule],
  providers: [
    OrganizationsService,
    OrganizationRepository,
    OrganizationLogoService,
    OrganizationAccessService,
    OrganizationSlugRepository,
    OrganizationmembershipRepository,
  ],
})
export class OrganizationModule {}

export * from './dtos';
export * from './types';
export * from './utils';
export * from './models';
export * from './guards';
export * from './mappers';
export * from './services';
export * from './constants';
export * from './converters';
export * from './decorators';
export * from './repositories';
