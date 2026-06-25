import { Timestamp } from 'firebase-admin/firestore';
import { BadRequestException, Injectable } from '@nestjs/common';

import { Organization } from '../entities';
import { OrganizationStatus } from '../enums';

@Injectable()
export class OrganizationDomainService {
  archive(organization: Organization): void {
    if (organization.status === OrganizationStatus.ARCHIVED) {
      throw new BadRequestException('Organization is already archived');
    }

    organization.status = OrganizationStatus.ARCHIVED;

    organization.updatedAt = Timestamp.now();
  }

  restore(organization: Organization): void {
    if (organization.status === OrganizationStatus.ACTIVE) {
      throw new BadRequestException('Organization is already active');
    }

    organization.status = OrganizationStatus.ACTIVE;

    organization.updatedAt = Timestamp.now();
  }
}
