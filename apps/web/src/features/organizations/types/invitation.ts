import type { OrganizationRole } from './permission';
import type { FirebaseTimestampLike } from './member';

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
  invitedBy: string;
  createdAt: FirebaseTimestampLike;
  expiresAt: FirebaseTimestampLike;
  updatedAt: FirebaseTimestampLike;
  organizationId: string;
  userId?: string | null;
  roles: OrganizationRole[];
  acceptedBy?: string | null;
  acceptedAt?: FirebaseTimestampLike | null;
  status: OrganizationInvitationStatus;
}
