import { User } from '@/users';
import { toIso } from '@/common';

import { OrganizationMemberDto } from '../dtos';
import { OrganizationMembership } from '../entities';

export class OrganizationMemberMapper {
  static toDto(
    user: User,
    membership: OrganizationMembership,
  ): OrganizationMemberDto {
    return {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      avatarUrl: user.photoUrl,
      status: membership.status,
      roles: membership.roles,
      joinedAt: toIso(membership.joinedAt)!,
      removedAt: toIso(membership.removedAt)!,
    };
  }
}
