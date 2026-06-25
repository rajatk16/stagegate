import { Injectable, NotFoundException } from '@nestjs/common';

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
      throw new NotFoundException('Organization not found');
    }

    return {
      organization,
      organizationMembership,
    };
  }
}
