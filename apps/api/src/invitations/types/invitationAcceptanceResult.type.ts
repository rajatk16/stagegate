import type { OrganizationMembership } from '../../organizations/models';

export interface InvitationAcceptanceResult {
  scopeType: 'ORGANIZATION';
  organizationId: string;
  membership: OrganizationMembership;
  alreadyAccepted: boolean;
}
