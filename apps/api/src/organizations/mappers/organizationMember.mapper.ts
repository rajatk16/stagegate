import type { OrganizationMembership } from '../models';
import type { OrganizationMembersPage } from '../types';
import {
  OrganizationMemberResponseDto,
  OrganizationMembersResponseDto,
  OrganizationTeamMemberResponseDto,
} from '../dtos';
import { canManageOrganizationMemberStatus } from '../utils';
import { ORGANIZATION_MEMBERSHIP_STATUS } from '../enums';

export const toOrganizationMemberResponseDto = (
  membership: OrganizationMembership,
): OrganizationMemberResponseDto =>
  Object.assign(new OrganizationMemberResponseDto(), {
    uid: membership.uid,
    role: membership.role,
    status: membership.status,
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.updatedAt.toISOString(),
  });

export const toOrganizationMembersResponseDto = (
  page: OrganizationMembersPage,
  actor: OrganizationMembership,
): OrganizationMembersResponseDto =>
  Object.assign(new OrganizationMembersResponseDto(), {
    items: page.items.map((member) => {
      const canManage = canManageOrganizationMemberStatus(actor, member);

      return Object.assign(
        new OrganizationTeamMemberResponseDto(),
        toOrganizationMemberResponseDto(member),
        {
          displayName: member.displayName,
          email: member.email,
          actions: {
            suspend:
              canManage &&
              member.status === ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE,
            reactivate:
              canManage &&
              member.status === ORGANIZATION_MEMBERSHIP_STATUS.SUSPENDED,
          },
        },
      );
    }),
    nextCursor: page.nextCursor,
  });
