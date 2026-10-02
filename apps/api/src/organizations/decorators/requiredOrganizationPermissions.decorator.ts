import { SetMetadata } from '@nestjs/common';

import { OrganizationPermission } from '../types';
import { ORGANIZATION_PERMISSIONS_KEY } from '../constants';

export const RequireOrganizationPermissions = (
  ...permissions: [OrganizationPermission, ...OrganizationPermission[]]
): MethodDecorator => SetMetadata(ORGANIZATION_PERMISSIONS_KEY, permissions);
