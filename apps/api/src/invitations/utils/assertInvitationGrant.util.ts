import { HttpStatus } from '@nestjs/common';

import { ApiException } from '../../common/exceptions/api.exception';
import { INVITABLE_ORGANIZATION_ROLES } from '../models/organizationInvitation.model';
import { OrganizationMembership } from '../../organizations/models/organizationMembership.model';
import { assertOrganizationPermissions } from '../../organizations/utils/organization.util';
import { ORGANIZATION_ROLE_CHANGE_TARGETS } from '../../organizations/constants';

export const assertInvitationGrant = (
  inviter: OrganizationMembership,
  role: INVITABLE_ORGANIZATION_ROLES,
): void => {
  assertOrganizationPermissions(inviter, ['organization:members:manage']);

  const allowed = ORGANIZATION_ROLE_CHANGE_TARGETS[inviter.role] ?? [];

  if (!allowed.includes(role)) {
    throw new ApiException(
      HttpStatus.FORBIDDEN,
      'ORGANIZATION_INVITATION_ROLE_FORBIDDEN',
      'You cannot invite someone with this role',
    );
  }
};
