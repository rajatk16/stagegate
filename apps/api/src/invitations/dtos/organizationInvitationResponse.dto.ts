import type { EmailReceipt } from '../../email';

import type { OrganizationInvitation } from '../models';
import { OrganizationMembershipResponseDto } from '../../organizations';

export class OrganizationInvitationResponseDto {
  id!: string;
  organizationId!: string;
  recipientEmail!: string;
  role!: OrganizationInvitation['role'];
  status!: OrganizationInvitation['status'];
  expiresAt!: string;
  emailStatus!: EmailReceipt['status'];
}

export class AcceptOrganizationInvitationResponseDto {
  organizationId!: string;
  membership!: OrganizationMembershipResponseDto;
  alreadyAccepted!: boolean;
}
