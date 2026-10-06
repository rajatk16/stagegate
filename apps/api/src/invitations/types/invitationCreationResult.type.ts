import { OrganizationInvitation } from '../models';

export interface InvitationCreationResult {
  invitation: OrganizationInvitation;
  organizationName: string;
}
