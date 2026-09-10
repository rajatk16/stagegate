import { Injectable } from '@nestjs/common';

import { TenancyError } from '../utils';
import { AuthenticatedUser } from '../../auth';
import { OrganizationPolicyService } from './organizationPolicy.service';
import { MembershipRepository, OrganizationRepository } from '../repositories';
import {
  OrganizationContext,
  OrganizationPermission,
  OrganizationResponse,
} from '../types';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly memberships: MembershipRepository,
    private readonly policy: OrganizationPolicyService,
    private readonly organizations: OrganizationRepository,
  ) {}

  async create(
    actor: AuthenticatedUser,
    name: string,
    requestId: string,
  ): Promise<OrganizationResponse> {
    const context = await this.organizations.createWithOwner(
      name,
      actor.uid,
      requestId,
    );

    return this.toOrganizationResponse(context);
  }

  async list(
    actor: AuthenticatedUser,
  ): Promise<readonly OrganizationResponse[]> {
    const candidates = await this.memberships.listActiveForUser(actor.uid);
    const memberships = candidates.filter((membership) =>
      this.policy.can(
        membership,
        actor.uid,
        membership.organizationId,
        OrganizationPermission.ORGANIZATION_READ,
      ),
    );

    const organizations = await this.organizations.findMany(
      memberships.map((membership) => membership.organizationId),
    );

    const organizationById = new Map(
      organizations.map((organization) => [
        organization.organizationId,
        organization,
      ]),
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

  async get(
    actor: AuthenticatedUser,
    organizationId: string,
  ): Promise<OrganizationResponse> {
    const membership = await this.policy.authorize(
      actor,
      organizationId,
      OrganizationPermission.ORGANIZATION_READ,
    );

    const organization = await this.organizations.find(organizationId);

    if (organization === null) {
      throw new TenancyError('TENANCY_DATA_INVALID');
    }

    return this.toOrganizationResponse({
      organization,
      membership,
    });
  }

  private toOrganizationResponse(
    context: OrganizationContext,
  ): OrganizationResponse {
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
