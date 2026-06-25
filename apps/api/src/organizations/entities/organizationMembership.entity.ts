import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationRole } from '@/authorization/enums';

import { MembershipStatus } from '../enums';

export class OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  roles: OrganizationRole[];
  status: MembershipStatus;
  joinedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
