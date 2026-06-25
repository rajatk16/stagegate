import { Injectable } from '@nestjs/common';

import { OrganizationMembershipRepository } from './repositories';

@Injectable()
export class OrganizationMembershipService {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  async getMembership(userId: string, organizationId: string) {
    return this.organizationMembershipRepository.findByUserAndOrganization(
      userId,
      organizationId,
    );
  }

  async getOrganizationMembers(organizationId: string) {
    return this.organizationMembershipRepository.findByOrganization(
      organizationId,
    );
  }

  async getUserOrganizations(userId: string) {
    return this.organizationMembershipRepository.findByUser(userId);
  }
}
