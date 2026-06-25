import { Injectable } from '@nestjs/common';

import { OrganizationMembershipRepository } from '../repositories';

@Injectable()
export class OrganizationMembershipService {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  async findMembership(userId: string, organizationId: string) {
    return this.organizationMembershipRepository.findByUserAndOrganization(
      userId,
      organizationId,
    );
  }

  async findUserMemberships(userId: string) {
    return this.organizationMembershipRepository.findByUser(userId);
  }

  async findOrganizationMembers(organizationId: string) {
    return this.organizationMembershipRepository.findByOrganization(
      organizationId,
    );
  }

  async findActiveMembers(organizationId: string) {
    return this.organizationMembershipRepository.findActiveByOrganization(
      organizationId,
    );
  }

  async findActiveMembership(userId: string, organizationId: string) {
    return this.organizationMembershipRepository.findActiveByUserAndOrganization(
      userId,
      organizationId,
    );
  }
}
