import { OrganizationRole } from '@/authorization/enums';
import { Timestamp } from 'firebase-admin/firestore';

export class OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  roles: OrganizationRole[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
