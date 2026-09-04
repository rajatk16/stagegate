import { describe, expect, it } from '@jest/globals';

import * as tenancy from './index';
import * as filters from './filters';
import * as modules from './modules';
import * as services from './services';
import * as controllers from './controllers';
import * as repositories from './repositories';
import * as utils from './utils';

describe('tenancy exports', () => {
  it('exports the runtime tenancy platform surface from the root barrel', () => {
    expect(tenancy).toMatchObject({
      TenancyError: utils.TenancyError,
      parseCreateOrganization: utils.parseCreateOrganization,
      parseOrganizationId: utils.parseOrganizationId,
      TenancyExceptionFilter: filters.TenancyExceptionFilter,
      TenancyModule: modules.TenancyModule,
      MembershipService: services.MembershipService,
      OrganizationService: services.OrganizationService,
      MembershipsController: controllers.MembershipsController,
      OrganizationsControllers: controllers.OrganizationsControllers,
      MembershipRepository: repositories.MembershipRepository,
      FirestoreMembershipRepository: repositories.FirestoreMembershipRepository,
      OrganizationRepository: repositories.OrganizationRepository,
      FirestoreOrganizationRepository: repositories.FirestoreOrganizationRepository,
    });
  });
});
