import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { Event } from '../entities';
import { EventStatus } from '../enums';

export const eventConverter: FirestoreDataConverter<Event> = {
  toFirestore: (event: Event) => ({
    ...event,
  }),

  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      organizationId: data.organizationId as string,
      name: data.name as string,
      slug: data.slug as string,
      publicId: data.publicId as string,
      description: data.description as string | null,
      timezone: data.timezone as string,
      startsAt: toNullableDate(data.startsAt),
      endsAt: toNullableDate(data.endsAt),
      status: data.status as EventStatus,
      publishedAt: toNullableDate(data.publishedAt),
      archivedAt: toNullableDate(data.archivedAt),
      createdBy: data.createdBy as string,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};
