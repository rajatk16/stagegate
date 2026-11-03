import { OrganizationInvitation } from '../models/organizationInvitation.model';

export interface InvitationCreationResult {
  invitation: OrganizationInvitation;
  organizationName: string;
}
