import { Timestamp } from 'firebase-admin/firestore';

import { Organization } from '../models';

export type OrganizationDocument = Omit<
  Organization,
  'createdAt' | 'updatedAt'
> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
