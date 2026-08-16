import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { Organization } from '../entities';
import { OrganizationStatus } from '../enums';

@Injectable()
export class OrganizationLifecyclePolicyService {
  assertWriteable(organization: Organization): void {
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new ApplicationException(
        ErrorCode.ORGANIZATION_ARCHIVED,
        HttpStatus.CONFLICT,
        'This organization is archived and is read-only',
      );
    }
  }

  isPubliclyAccessible(organization: Organization): boolean {
    return organization.status === OrganizationStatus.ACTIVE;
  }
}
