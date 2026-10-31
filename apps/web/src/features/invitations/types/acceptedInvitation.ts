import type { ORGANIZATION_ROLES } from '@/features/organizations';

export type AcceptedInvitation = {
  scopeType: 'ORGANIZATION';
  organizationId: string;
  membership: {
    uid: string;
    role: ORGANIZATION_ROLES;
  };
  alreadyAccepted: boolean;
};
