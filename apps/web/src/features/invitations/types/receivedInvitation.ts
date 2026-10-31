import type { ORGANIZATION_ROLES } from '@/features/organizations';

export type ReceivedInvitation = {
  id: string;
  scopeType: 'ORGANIZATION';
  organizationId: string;
  organizationName: string;
  role: Exclude<ORGANIZATION_ROLES, 'OWNER'>;
  expiresAt: string;
};
