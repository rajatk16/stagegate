import { OrganizationMembershipResponseDto } from '../../organizations';
import { InvitationAcceptanceResult, InvitationIssueResult } from '../types';
import {
  OrganizationInvitationResponseDto,
  AcceptOrganizationInvitationResponseDto,
} from '../dtos';

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

export const toAcceptOrganizationInvitationResponseDto = (
  result: InvitationAcceptanceResult,
): AcceptOrganizationInvitationResponseDto =>
  Object.assign(new AcceptOrganizationInvitationResponseDto(), {
    organizationId: result.organizationId,
    membership: Object.assign(new OrganizationMembershipResponseDto(), {
      uid: result.membership.uid,
      role: result.membership.role,
    }),
    alreadyAccepted: result.alreadyAccepted,
  });
