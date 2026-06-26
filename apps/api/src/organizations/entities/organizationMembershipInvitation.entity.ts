import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { OrganizationMembershipInvitationStatus } from '../enums';

export class OrganizationMembershipInvitation {
  id: string;
  organizationId: string;
  email: string;
  userId?: string | null;
  roles: OrganizationRole[];
  invitedBy: string;
  status: OrganizationMembershipInvitationStatus;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp | null;
  acceptedBy?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
