import type { OrganizationRole } from './permission';

export enum OrganizationInvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
}

export interface CreateOrganizationInvitationRequest {
  email: string;
  roles: OrganizationRole[];
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  roles: OrganizationRole[];
  status: OrganizationInvitationStatus;
  expiresAt: Date;
}
