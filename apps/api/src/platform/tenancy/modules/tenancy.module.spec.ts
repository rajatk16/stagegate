import 'reflect-metadata';
import { MODULE_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from '@jest/globals';

import { TenancyExceptionFilter } from '../filters';
import { MembershipService, OrganizationService } from '../services';
import { MembershipsController, OrganizationsControllers } from '../controllers';
import {
  MembershipRepository,
  OrganizationRepository,
  FirestoreMembershipRepository,
  FirestoreOrganizationRepository,
} from '../repositories';
import { TenancyModule } from './tenancy.module';

describe('TenancyModule', () => {
  it('registers controllers, providers, and exported services', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, TenancyModule)).toEqual([
      MembershipsController,
      OrganizationsControllers,
    ]);
    expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, TenancyModule)).toEqual([
      OrganizationService,
      MembershipService,
      MembershipRepository,
    ]);
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, TenancyModule)).toEqual([
      MembershipService,
      OrganizationService,
      TenancyExceptionFilter,
      {
        provide: MembershipRepository,
        useClass: FirestoreMembershipRepository,
      },
      {
        provide: OrganizationRepository,
        useClass: FirestoreOrganizationRepository,
      },
    ]);
  });
});
