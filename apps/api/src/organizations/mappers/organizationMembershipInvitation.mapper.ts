import { OrganizationMembershipInvitation } from '../entities';

export class OrganizationMembershipInvitationMapper {
  static toDto(invitation: OrganizationMembershipInvitation) {
    return {
      id: invitation.id,
      email: invitation.email,
      roles: invitation.roles,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    };
  }
}
