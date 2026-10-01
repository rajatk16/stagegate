import { Module } from '@nestjs/common';

import { AuditModule } from '../audit';
import { FirebaseModule } from '../firebase';
import { OrganizationsService } from './services';
import { OrganizationsController } from './controllers';
import {
  OrganizationRepository,
  OrganizationSlugRepository,
  OrganizationmembershipRepository,
} from './repositories';

@Module({
  imports: [FirebaseModule, AuditModule],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    OrganizationRepository,
    OrganizationSlugRepository,
    OrganizationmembershipRepository,
  ],
})
export class OrganizationModule {}

export * from './dtos';
export * from './types';
export * from './utils';
export * from './models';
export * from './mappers';
export * from './services';
export * from './constants';
export * from './converters';
export * from './repositories';
