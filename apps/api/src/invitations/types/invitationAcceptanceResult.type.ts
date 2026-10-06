import { OrganizationMembership } from '../../organizations';

export interface InvitationAcceptanceResult {
  organizationId: string;
  membership: OrganizationMembership;
  alreadyAccepted: boolean;
}
