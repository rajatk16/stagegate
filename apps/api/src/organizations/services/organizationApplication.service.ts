import { ForbiddenException, Injectable } from '@nestjs/common';

import { OrganizationMapper } from '../mappers';
import {
  OrganizationService,
  OrganizationMembershipService,
} from '../services';

@Injectable()
export class OrganizationApplicationService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationMembershipService: OrganizationMembershipService,
  ) {}

  async getOrganizationsForUser(userId: string) {
    const memberships =
      await this.organizationMembershipService.findUserMemberships(userId);

    if (!memberships || memberships.length === 0) {
      return [];
    } else {
      const organizationIds = memberships.map(
        (membership) => membership.organizationId,
      );

      const organizations =
        await this.organizationService.findByIds(organizationIds);

      return organizations.map(OrganizationMapper.toSummaryDto);
    }
  }

  async getOrganization(organizationSlug: string, userId: string) {
    const organization =
      await this.organizationService.findBySlug(organizationSlug);

    const membership = await this.organizationMembershipService.findMembership(
      userId,
      organization.id,
    );

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return OrganizationMapper.toDetailsDto(organization);
  }
}
