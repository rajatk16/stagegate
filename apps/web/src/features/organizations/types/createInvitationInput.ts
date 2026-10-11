import { INVITATION_ROLES } from './invitationRoles';

export type CreateInvitationInput = {
  email: string;
  role: INVITATION_ROLES;
};
