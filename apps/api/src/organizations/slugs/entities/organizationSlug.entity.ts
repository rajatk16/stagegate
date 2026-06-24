import { Timestamp } from 'firebase-admin/firestore';

export class OrganizationSlug {
  slug: string;
  organizationId: string;
  createdAt: Timestamp;
}
