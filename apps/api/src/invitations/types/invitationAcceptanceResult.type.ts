import type { OrganizationMembership } from '../../organizations/models/organizationMembership.model';

export interface InvitationAcceptanceResult {
  scopeType: 'ORGANIZATION';
  organizationId: string;
  membership: OrganizationMembership;
  alreadyAccepted: boolean;
}
