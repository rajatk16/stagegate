import { Injectable } from '@nestjs/common';
import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';
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

  async findMembershipById(id: string) {
    return this.organizationMembershipRepository.findById(id);
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

  async isActiveMember(organizationId: string, userId: string) {
    const membership = await this.findActiveMembership(userId, organizationId);

    return membership !== null;
  }

  async updateRoles(
    membership: OrganizationMembership,
    roles: OrganizationRole[],
  ): Promise<void> {
    membership.roles = [...new Set(roles)];
    membership.updatedAt = Timestamp.now();

    await this.organizationMembershipRepository.save(membership);
  }

  async isOwner(organizationId: string, userId: string) {
    return this.organizationMembershipRepository.isOwner(
      organizationId,
      userId,
    );
  }

  async remove(membership: OrganizationMembership, removedBy: string) {
    membership.status = MembershipStatus.REMOVED;
    membership.removedBy = removedBy;
    membership.removedAt = Timestamp.now();
    membership.updatedAt = Timestamp.now();

    await this.organizationMembershipRepository.save(membership);
  }
}
