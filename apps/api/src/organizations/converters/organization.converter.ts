import { FirestoreDataConverter, Timestamp } from 'firebase-admin/firestore';

import { Organization } from '../entities';
import { OrganizationStatus } from '../enums';

const toDate = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  throw new Error('Expected Firestore Timestamp');
};

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
