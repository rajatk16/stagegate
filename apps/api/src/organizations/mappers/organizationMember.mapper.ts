import type { OrganizationMembership } from '../models';
import type { OrganizationMembersPage } from '../types';
import {
  OrganizationMemberResponseDto,
  OrganizationMembersResponseDto,
  OrganizationTeamMemberResponseDto,
} from '../dtos';

export const toOrganizationMemberResponseDto = (
  membership: OrganizationMembership,
): OrganizationMemberResponseDto =>
  Object.assign(new OrganizationMemberResponseDto(), {
    uid: membership.uid,
    role: membership.role,
    status: 'ACTIVE',
    createdAt: membership.createdAt.toISOString(),
    updatedAt: membership.updatedAt.toISOString(),
  });

export const toOrganizationMembersResponseDto = (
  page: OrganizationMembersPage,
): OrganizationMembersResponseDto =>
  Object.assign(new OrganizationMembersResponseDto(), {
    items: page.items.map((member) =>
      Object.assign(
        new OrganizationTeamMemberResponseDto(),
        toOrganizationMemberResponseDto(member),
        {
          displayName: member,
          email: member.email,
        },
      ),
    ),
    nextCursor: page.nextCursor,
  });
