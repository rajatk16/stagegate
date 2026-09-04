import { Injectable } from '@nestjs/common';

import { TenancyError } from '../utils';
import { AuthenticatedUser } from '../../auth';
import { OrganizationContext, OrganizationResponse } from '../types';
import { MembershipRepository, OrganizationRepository } from '../repositories';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizations: OrganizationRepository,
    private readonly memberships: MembershipRepository,
  ) {}

  async create(
    actor: AuthenticatedUser,
    name: string,
    requestId: string,
  ): Promise<OrganizationResponse> {
    const context = await this.organizations.createWithOwner(name, actor.uid, requestId);

    return this.toOrganizationResponse(context);
  }

  async list(actor: AuthenticatedUser): Promise<readonly OrganizationResponse[]> {
    const memberships = await this.memberships.listActiveForUser(actor.uid);
    const organizations = await this.organizations.findMany(
      memberships.map((membership) => membership.organizationId),
    );

    const organizationById = new Map(
      organizations.map((organization) => [organization.organizationId, organization]),
    );

    return memberships
      .map((membership) => {
        const organization = organizationById.get(membership.organizationId);

        if (organization === undefined) {
          throw new TenancyError('TENANCY_DATA_INVALID');
        }

        return this.toOrganizationResponse({
          organization,
          membership,
        });
      })
      .sort(
        (left, right) =>
          left.name.localeCompare(right.name) ||
          left.organizationId.localeCompare(right.organizationId),
      );
  }

  async get(actor: AuthenticatedUser, organizationId: string): Promise<OrganizationResponse> {
    const membership = await this.memberships.findActive(organizationId, actor.uid);

    if (membership === null) {
      throw new TenancyError('ORGANIZATION_NOT_FOUND');
    }

    const organization = await this.organizations.find(organizationId);

    if (organization === null) {
      throw new TenancyError('TENANCY_DATA_INVALID');
    }

    return this.toOrganizationResponse({
      organization,
      membership,
    });
  }

  private toOrganizationResponse(context: OrganizationContext): OrganizationResponse {
    return {
      organizationId: context.organization.organizationId,
      name: context.organization.name,
      version: context.organization.version,
      membership: {
        membershipId: context.membership.membershipId,
        role: context.membership.role,
        status: context.membership.status,
      },
      createdAt: context.organization.createdAt.toISOString(),
      updatedAt: context.organization.updatedAt.toISOString(),
    };
  }
}
