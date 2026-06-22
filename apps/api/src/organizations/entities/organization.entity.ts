import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationStatus } from '../enums';

export class Organization {
  id: string;

  name: string;

  slug: string;

  description?: string | null;

  websiteUrl?: string | null;

  logoUrl?: string | null;

  status: OrganizationStatus;

  createdBy: string;

  createdAt: Timestamp;

  updatedAt: Timestamp;
}
