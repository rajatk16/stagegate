import { ORGANIZATION_ROLES } from '../../organizations/enums';

export interface OrganizationInvitationAuditInput {
  action:
    | 'organization.invitation.created'
    | 'organization.invitation.accepted'
    | 'organization.invitation.revoked';
  actorUid: string;
  organizationId: string;
  invitationId: string;
  role: Exclude<ORGANIZATION_ROLES, ORGANIZATION_ROLES.OWNER>;
  occurredAt: Date;
}
