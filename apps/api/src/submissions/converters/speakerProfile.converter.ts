import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate } from '@/common';

import { SpeakerProfile } from '../entities';

export const speakerProfileConverter: FirestoreDataConverter<SpeakerProfile> = {
  toFirestore: (speakerProfile: SpeakerProfile) => ({
    ...speakerProfile,
  }),

  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      eventId: data.eventId as string,
      userId: data.userId as string,

      displayName: data.displayName as string,
      biography: data.biography as string | null,
      organization: data.organization as string | null,
      jobTitle: data.jobTitle as string | null,
      location: data.location as string | null,
      websiteUrl: data.websiteUrl as string | null,
      pronouns: data.pronouns as string | null,

      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
    };
  },
};
