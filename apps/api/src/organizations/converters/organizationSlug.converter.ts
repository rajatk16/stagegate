import {
  DocumentData,
  QueryDocumentSnapshot,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { OrganizationSlug } from '../entities';

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
