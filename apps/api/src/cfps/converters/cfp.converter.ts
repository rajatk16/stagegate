import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { CfpStatus } from '../enums';
import { Cfp, CfpConsentDefinition } from '../entities';

export const cfpConverter: FirestoreDataConverter<Cfp> = {
  toFirestore: (cfp: Cfp) => ({
    ...cfp,
  }),

  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      allowDrafts: data.allowDrafts as boolean,
      allowEditsWhileOpen: data.allowEditsWhileOpen as boolean,
      allowWithdrawals: data.allowWithdrawals as boolean,
      closedAt: toNullableDate(data.closedAt),
      closesAt: toNullableDate(data.closesAt),
      createdAt: toDate(data.createdAt),
      createdBy: data.createdBy as string,
      description: data.description as string | null,
      eventId: data.eventId as string,
      id: snapshot.id,
      maxSpeakersPerSubmission: data.maxSpeakersPerSubmission as number,
      maxSubmissionsPerSpeaker: data.maxSubmissionsPerSpeaker as number,
      openedAt: toNullableDate(data.openedAt),
      opensAt: toNullableDate(data.opensAt),
      requiredConsent: data.requiredConsent as CfpConsentDefinition | null,
      status: data.status as CfpStatus,
      timezone: data.timezone as string,
      title: data.title as string,
      updatedAt: toDate(data.updatedAt),
    };
  },
};
