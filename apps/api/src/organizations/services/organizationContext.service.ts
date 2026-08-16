import { Injectable, HttpStatus } from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { MembershipStatus } from '../enums';
import { OrganizationService } from './organization.service';
import { Organization, OrganizationMembership } from '../entities';
import { OrganizationMembershipService } from './organizationMembership.service';

@Injectable()
export class OrganizationContextService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMembershipService: OrganizationMembershipService,
  ) {}

  async resolve(
    organizationSlug: string,
    userId: string,
  ): Promise<{
    organization: Organization;
    organizationMembership: OrganizationMembership;
  }> {
    const organization =
      await this.organizationService.findBySlug(organizationSlug);

    const organizationMembership =
      await this.organizationMembershipService.findMembership(
        userId,
        organization.id,
      );

    if (!organizationMembership) {
      throw new ApplicationException(
        ErrorCode.RESOURCE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Organization not found',
      );
    }

    if (organizationMembership.status !== MembershipStatus.ACTIVE) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You are not an active member of this organization',
      );
    }

    return {
      organization,
      organizationMembership,
    };
  }
}
