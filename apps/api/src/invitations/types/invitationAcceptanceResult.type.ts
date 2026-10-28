import type { EventMembership } from '../../events/models';
import type { OrganizationMembership } from '../../organizations/models';

export type InvitationAcceptanceResult =
  | {
      scopeType: 'ORGANIZATION';
      organizationId: string;
      membership: OrganizationMembership;
      alreadyAccepted: boolean;
    }
  | {
      scopeType: 'EVENT';
      organizationId: string;
      eventId: string;
      membership: EventMembership;
      alreadyAccepted: boolean;
    };
