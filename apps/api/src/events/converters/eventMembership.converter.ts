import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { EventRole } from '@/auth';
import { toDate, toNullableDate } from '@/common';

import { EventMembership } from '../entities';
import { EventMembershipStatus } from '../enums';

export const eventMembershipConverter: FirestoreDataConverter<EventMembership> =
  {
    toFirestore: (eventMembership: EventMembership) => ({
      ...eventMembership,
    }),

    fromFirestore: (snapshot) => {
      const data = snapshot.data();

      return {
        id: snapshot.id,
        role: data.role as EventRole,
        userId: data.userId as string,
        eventId: data.eventId as string,
        joinedAt: toDate(data.joinedAt),
        createdAt: toDate(data.createdAt),
        removedAt: toNullableDate(data.removedAt),
        updatedAt: toDate(data.updatedAt),
        removedBy: data.removedBy as string | null,
        status: data.status as EventMembershipStatus,
      };
    },
  };
