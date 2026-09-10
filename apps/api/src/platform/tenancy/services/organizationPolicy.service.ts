import { Injectable } from '@nestjs/common';

import { TenancyError } from '../utils';
import { AuthenticatedUser } from '../../auth';
import { MembershipRepository } from '../repositories';
import { Membership, MembershipRole, MembershipStatus, OrganizationPermission } from '../types';

const ROLE_PERMISSIONS: Readonly<Record<MembershipRole, readonly OrganizationPermission[]>> =
  Object.freeze({
    OWNER: Object.freeze<OrganizationPermission[]>([
      OrganizationPermission.ORGANIZATION_READ,
      OrganizationPermission.ORGANIZATION_UPDATE,
      OrganizationPermission.MEMBERSHIP_READ,
      OrganizationPermission.INVITATION_CREATE,
      OrganizationPermission.OWNERSHIP_TRANSFER,
    ]),
    ADMIN: Object.freeze<OrganizationPermission[]>([
      OrganizationPermission.ORGANIZATION_READ,
      OrganizationPermission.ORGANIZATION_UPDATE,
      OrganizationPermission.MEMBERSHIP_READ,
      OrganizationPermission.INVITATION_CREATE,
    ]),
    EVENT_MANAGER: Object.freeze<OrganizationPermission[]>([
      OrganizationPermission.MEMBERSHIP_READ,
    ]),
    REVIEWER: Object.freeze<OrganizationPermission[]>([OrganizationPermission.ORGANIZATION_READ]),
    SUBMITTER: Object.freeze<OrganizationPermission[]>([OrganizationPermission.MEMBERSHIP_READ]),
    OBSERVER: Object.freeze<OrganizationPermission[]>([OrganizationPermission.MEMBERSHIP_READ]),
  });

@Injectable()
export class OrganizationPolicyService {
  constructor(private readonly memberships: MembershipRepository) {}

  async authorize(
    actor: AuthenticatedUser,
    organizationId: string,
    permission: OrganizationPermission,
  ): Promise<Membership> {
    const membership = await this.memberships.findActive(organizationId, actor.uid);

    return this.assertAllowed(membership, actor.uid, organizationId, permission);
  }

  assertAllowed(
    membership: Membership | null,
    actorId: string,
    organizationId: string,
    permission: OrganizationPermission,
  ): Membership {
    if (membership === null || !this.matchesContext(membership, actorId, organizationId)) {
      throw new TenancyError('ORGANIZATION_NOT_FOUND');
    }

    if (!this.permissionsForRole(membership.role).includes(permission)) {
      throw new TenancyError('PERMISSION_DENIED');
    }

    return membership;
  }

  can(
    membership: Membership | null,
    actorId: string,
    organizationId: string,
    permission: OrganizationPermission,
  ): boolean {
    return (
      membership !== null &&
      this.matchesContext(membership, actorId, organizationId) &&
      this.permissionsForRole(membership.role).includes(permission)
    );
  }

  private matchesContext(membership: Membership, actorId: string, organizationId: string): boolean {
    return (
      membership.status === MembershipStatus.ACTIVE &&
      membership.userId === actorId &&
      membership.organizationId === organizationId &&
      membership.membershipId === `${organizationId}_${actorId}`
    );
  }

  private permissionsForRole(role: MembershipRole): readonly OrganizationPermission[] {
    if (!Object.hasOwn(ROLE_PERMISSIONS, role)) {
      return [];
    }

    return ROLE_PERMISSIONS[role];
  }
}
