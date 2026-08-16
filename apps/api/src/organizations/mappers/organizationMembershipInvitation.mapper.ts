import { toIso } from '@/common';

import { OrganizationMembershipInvitation } from '../entities';

export class OrganizationMembershipInvitationMapper {
  static toDto(invitation: OrganizationMembershipInvitation) {
    return {
      id: invitation.id,
      email: invitation.email,
      roles: invitation.roles,
      status: invitation.status,
      userId: invitation.userId ?? null,
      expiresAt: toIso(invitation.expiresAt)!,
      invitedBy: invitation.invitedBy,
      createdAt: toIso(invitation.createdAt)!,
    };
  }
}
