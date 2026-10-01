import { Timestamp } from 'firebase-admin/firestore';

import { OrganizationMembership } from '../models';

export type OrganizationMembershipDocument = Omit<
  OrganizationMembership,
  'createdAt' | 'updatedAt'
> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
