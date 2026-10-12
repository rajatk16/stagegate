import { OrganizationRole } from '@/features/organizations';

export type AcceptedInvitation = {
  organizationId: string;
  membership: {
    uid: string;
    role: OrganizationRole;
  };
  alreadyAccepted: boolean;
};
