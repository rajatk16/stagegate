import { INVITATION_ROLES } from './invitationRoles';
import { PendingInvitation } from './pendingInvitation';

export type InvitationPage = {
  items: PendingInvitation[];
  nextCursor: string | null;
  allowedRoles: INVITATION_ROLES[];
};
