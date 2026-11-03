import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationSlug } from '../models/organizationSlug.model';

export type OrganizationSlugDocument = Omit<OrganizationSlug, 'createdAt'> & {
  createdAt: Timestamp;
};
