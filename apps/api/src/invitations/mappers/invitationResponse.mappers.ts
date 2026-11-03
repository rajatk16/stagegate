import { OrganizationInvitationResponseDto } from '../dtos/organizationInvitationResponse.dto';
import { InvitationAcceptanceResult } from '../types/invitationAcceptanceResult.type';
import { InvitationIssueResult } from '../types/invitationIssueResult.type';

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
) => ({
  scopeType: result.scopeType,
  organizationId: result.organizationId,
  membership: {
    uid: result.membership.uid,
    role: result.membership.role,
  },
  alreadyAccepted: result.alreadyAccepted,
});
