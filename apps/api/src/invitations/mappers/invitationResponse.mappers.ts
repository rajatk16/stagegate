import { OrganizationInvitationResponseDto } from '../dtos';
import { InvitationAcceptanceResult, InvitationIssueResult } from '../types';

export const toOrganizationInvitationResponseDto = (
  result: InvitationIssueResult,
): OrganizationInvitationResponseDto =>
  Object.assign(new OrganizationInvitationResponseDto(), {
    id: result.invitation.id,
    organizationId: result.invitation.scope.organizationId,
    recipientEmail: result.invitation.recipientEmail,
    role: result.invitation.role,
    status: result.invitation.status,
    expiresAt: result.invitation.expiresAt.toISOString(),
    emailStatus: result.emailStatus,
  });

export const toAcceptInvitationResponse = (
  result: InvitationAcceptanceResult,
) => {
  if (result.scopeType === 'EVENT') {
    return {
      scopeType: result.scopeType,
      organizationId: result.organizationId,
      eventId: result.eventId,
      membership: {
        organizationId: result.membership.organizationId,
        eventId: result.membership.eventId,
        uid: result.membership.uid,
        role: result.membership.role,
        status: result.membership.status,
        createdAt: result.membership.createdAt.toISOString(),
        updatedAt: result.membership.updatedAt.toISOString(),
      },
      alreadyAccepted: result.alreadyAccepted,
    };
  }

  return {
    scopeType: result.scopeType,
    organizationId: result.organizationId,
    membership: {
      uid: result.membership.uid,
      role: result.membership.role,
    },
    alreadyAccepted: result.alreadyAccepted,
  };
};
