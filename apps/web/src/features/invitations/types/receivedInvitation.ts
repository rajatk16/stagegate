import type { EventRole } from '@/features/events';
import type { ORGANIZATION_ROLES } from '@/features/organizations';

type Base = {
  id: string;
  organizationId: string;
  organizationName: string;
  expiresAt: string;
};

export type ReceivedInvitation =
  | (Base & {
      scopeType: 'ORGANIZATION';
      role: Exclude<ORGANIZATION_ROLES, 'OWNER'>;
    })
  | (Base & {
      scopeType: 'EVENT';
      eventId: string;
      eventName: string;
      role: EventRole;
    });
