import { OrganizationMembership } from '../../organizations/models';

export interface InvitationAcceptanceResult {
  organizationId: string;
  membership: OrganizationMembership;
  alreadyAccepted: boolean;
}
