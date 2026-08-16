import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { EventSlug } from '../entities';

export const eventSlugConverter: FirestoreDataConverter<EventSlug> = {
  toFirestore: (slug: EventSlug) => ({
    ...slug,
  }),
  fromFirestore: (snapshot) => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      slug: data.slug as string,
      eventId: data.eventId as string,
      createdAt: toDate(data.createdAt),
      organizationId: data.organizationId as string,
    };
  },
};
