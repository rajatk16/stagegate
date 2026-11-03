import type { EmailReceipt } from '../../email/types/emailReceipt.type';

import type { OrganizationInvitation } from '../models/organizationInvitation.model';
import { OrganizationMembershipResponseDto } from '../../organizations/dtos/organizationMembershipResponse.dto';

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
