import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common/utils';

import { Organization } from '../entities';
import { OrganizationStatus } from '../enums';

export const organizationConverter: FirestoreDataConverter<Organization> = {
  toFirestore: (organization: Organization) => ({
    ...organization,
  }),

  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      name: data.name as string,
      slug: data.slug as string,
      description: data.description as string | null,
      websiteUrl: data.websiteUrl as string | null,
      logoUrl: data.logoUrl as string | null,
      status: data.status as OrganizationStatus,
      createdBy: data.createdBy as string,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};
