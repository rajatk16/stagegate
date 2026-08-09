import { HttpStatus, Injectable } from '@nestjs/common';

import { ErrorCode } from '@/common/enums';
import { ApplicationException } from '@/common/utils';
import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';
import { OrganizationMembership } from '../entities';

@Injectable()
export class OrganizationAuthorizationPolicyService {
  assertCanManageMember(
    actor: OrganizationMembership,
    target: OrganizationMembership,
  ): void {
    if (actor.id === target.id) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot modify your own membership',
      );
    }

    if (target.roles.includes(OrganizationRole.OWNER)) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot modify the owner of the organization',
      );
    }

    if (!actor.roles.includes(OrganizationRole.MEMBER)) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You must be an owner or admin to modify a member.',
      );
    }

    if (
      actor.roles.includes(OrganizationRole.MEMBER) &&
      (target.roles.includes(OrganizationRole.OWNER) ||
        target.roles.includes(OrganizationRole.ADMIN))
    ) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot modify the role of an owner or admin',
      );
    }
  }

  assertCanTransferOwnership(
    actor: OrganizationMembership,
    target: OrganizationMembership,
  ): void {
    if (actor.id === target.id) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot transfer ownership to yourself',
      );
    }

    if (target.roles.includes(OrganizationRole.OWNER)) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot transfer ownership to the owner of the organization',
      );
    }

    if (!actor.roles.includes(OrganizationRole.OWNER)) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You must be an owner to transfer ownership.',
      );
    }

    if (target.status !== MembershipStatus.ACTIVE) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot transfer ownership to a member who is not active.',
      );
    }
  }

  assertCanLeaveOrganization(membership: OrganizationMembership): void {
    if (membership.roles.includes(OrganizationRole.OWNER)) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'You cannot leave the organization as the owner. You must transfer ownership to another member first.',
      );
    }
  }
}
