import { FirestoreDataConverter } from 'firebase-admin/firestore';

import { toDate, toNullableDate } from '@/common';

import { Proposal, ProposalConsent } from '../entities';
import { ProposalFormat, ProposalStatus } from '../enums';

export const proposalConverter: FirestoreDataConverter<Proposal> = {
  toFirestore: (proposal: Proposal) => ({
    ...proposal,
  }),

  fromFirestore: (snapshot) => {
    const data = snapshot.data();

    return {
      id: snapshot.id,
      eventId: data.eventId as string,
      cfpId: data.cfpId as string,
      ownerUserId: data.ownerUserId as string,
      primarySpeakerProfileId: data.primarySpeakerProfileId as string,
      status: data.status as ProposalStatus,
      title: data.title as string,
      abstract: data.abstract as string,
      description: data.description as string | null,
      format: data.format as ProposalFormat,
      durationMinutes: data.durationMinutes as number | null,
      language: data.language as string,
      consent: data.consent as ProposalConsent | null,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      submittedAt: toNullableDate(data.submittedAt),
      withdrawnAt: toNullableDate(data.withdrawnAt),
      primarySpeakerSnapshot: data.primarySpeakerSnapshot as {
        displayName: string;
        biography: string | null;
        organization: string | null;
        jobTitle: string | null;
        location: string | null;
        websiteUrl: string | null;
        pronouns: string | null;
      } | null,
    };
  },
};
