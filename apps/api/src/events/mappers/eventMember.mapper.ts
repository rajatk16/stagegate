import { User } from '@/users';

import { toIso } from '@/common';
import { EventMemberDto } from '../dtos';
import { EventMembership } from '../entities';

export class EventMemberMapper {
  static toDto = (user: User, membership: EventMembership): EventMemberDto => ({
    id: membership.id,
    userId: membership.userId,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.photoUrl ?? null,
    role: membership.role,
    status: membership.status,
    joinedAt: toIso(membership.joinedAt)!,
    createdAt: toIso(membership.createdAt)!,
    updatedAt: toIso(membership.updatedAt)!,
  });
}
