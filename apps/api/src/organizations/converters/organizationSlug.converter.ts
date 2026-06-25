import {
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { OrganizationSlug } from '../entities';

const toDate = (value: unknown): Timestamp => {
  if (value instanceof Timestamp) {
    return value;
  }
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }
  throw new Error('Expected Firestore Timestamp');
};

export const organizationSlugConverter: FirestoreDataConverter<OrganizationSlug> =
  {
    toFirestore: (slug: OrganizationSlug) => ({
      ...slug,
    }),
    fromFirestore: (
      snapshot: QueryDocumentSnapshot<DocumentData>,
    ): OrganizationSlug => {
      const data = snapshot.data();

      return {
        slug: data.slug as string,
        organizationId: data.organizationId as string,
        createdAt: toDate(data.createdAt),
      };
    },
  };
