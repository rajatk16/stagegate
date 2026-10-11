import { INVITATION_ROLES } from './invitationRoles';

export type OrganizationInvitation = {
  id: string;
  organizationId: string;
  recipientEmail: string;
  role: INVITATION_ROLES;
  status: 'PENDING';
  expiresAt: string;
};
