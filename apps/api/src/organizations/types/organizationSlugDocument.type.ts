import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationSlug } from '../models';

export type OrganizationSlugDocument = Omit<OrganizationSlug, 'createdAt'> & {
  createdAt: Timestamp;
};
