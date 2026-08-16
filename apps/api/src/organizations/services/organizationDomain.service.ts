import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { Organization } from '../entities';
import { OrganizationStatus } from '../enums';

@Injectable()
export class OrganizationDomainService {
  archive(organization: Organization): void {
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Organization is already archived',
      );
    }

    organization.status = OrganizationStatus.ARCHIVED;

    organization.updatedAt = Timestamp.now();
  }

  restore(organization: Organization): void {
    if (organization.status === OrganizationStatus.ACTIVE) {
      throw new ApplicationException(
        ErrorCode.VALIDATION_ERROR,
        HttpStatus.BAD_REQUEST,
        'Organization is already active',
      );
    }

    organization.status = OrganizationStatus.ACTIVE;

    organization.updatedAt = Timestamp.now();
  }
}
