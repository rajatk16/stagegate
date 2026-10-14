import { ORGANIZATION_ROLES } from '@/features/organizations/types';

export type ReceivedInvitation = {
  id: string;
  organizationId: string;
  organizationName: string;
  role: Exclude<ORGANIZATION_ROLES, 'OWNER'>;
  expiresAt: string;
};
