import { ORGANIZATION_ROLES } from '@/features/organizations/types';

export type AcceptedInvitation = {
  organizationId: string;
  membership: {
    uid: string;
    role: ORGANIZATION_ROLES;
  };
  alreadyAccepted: boolean;
};
