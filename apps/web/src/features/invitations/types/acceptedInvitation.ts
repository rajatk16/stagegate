import type { EventMember } from '@/features/events';
import type { ORGANIZATION_ROLES } from '@/features/organizations';

export type AcceptedInvitation =
  | {
      scopeType: 'ORGANIZATION';
      organizationId: string;
      membership: {
        uid: string;
        role: ORGANIZATION_ROLES;
      };
      alreadyAccepted: boolean;
    }
  | {
      scopeType: 'EVENT';
      organizationId: string;
      eventId: string;
      membership: EventMember;
      alreadyAccepted: boolean;
    };
