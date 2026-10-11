import type { EmailReceipt } from '../../email/types';

import type { OrganizationInvitation } from '../models';
import { OrganizationMembershipResponseDto } from '../../organizations/dtos';

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
