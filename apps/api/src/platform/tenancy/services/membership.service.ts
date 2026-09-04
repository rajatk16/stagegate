import { Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../../auth';
import { MembershipRepository } from '../repositories';
import { Membership, MembershipResponse } from '../types';

@Injectable()
export class MembershipService {
  constructor(private readonly memberships: MembershipRepository) {}

  async listMine(actor: AuthenticatedUser): Promise<readonly MembershipResponse[]> {
    const memberships = await this.memberships.listActiveForUser(actor.uid);

    return memberships
      .map((membership) => this.toResponse(membership))
      .sort((left, right) => left.organizationId.localeCompare(right.organizationId));
  }

  private toResponse(membership: Membership): MembershipResponse {
    return {
      membershipId: membership.membershipId,
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.role,
      status: membership.status,
      version: membership.version,
      createdAt: membership.createdAt.toISOString(),
      updatedAt: membership.updatedAt.toISOString(),
    };
  }
}
