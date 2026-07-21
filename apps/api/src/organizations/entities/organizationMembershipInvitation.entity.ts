import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { OrganizationMembershipInvitationStatus } from '../enums';

export class OrganizationMembershipInvitation {
  id: string;
  email: string;
  invitedBy: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  updatedAt: Timestamp;
  organizationId: string;
  userId?: string | null;
  roles: OrganizationRole[];
  acceptedBy?: string | null;
  acceptedAt?: Timestamp | null;
  status: OrganizationMembershipInvitationStatus;
}
