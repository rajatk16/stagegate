import { OrganizationRole } from '@/features/organizations';

export type ReceivedInvitation = {
  id: string;
  organizationId: string;
  organizationName: string;
  role: Exclude<OrganizationRole, 'OWNER'>;
  expiresAt: string;
};
