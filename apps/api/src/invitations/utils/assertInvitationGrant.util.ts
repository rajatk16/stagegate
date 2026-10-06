import { HttpStatus } from '@nestjs/common';

import { ApiException } from '../../common';
import { INVITABLE_ORGANIZATION_ROLES } from '../models';
import {
  OrganizationMembership,
  assertOrganizationPermissions,
  ORGANIZATION_ROLE_CHANGE_TARGETS,
} from '../../organizations';

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
