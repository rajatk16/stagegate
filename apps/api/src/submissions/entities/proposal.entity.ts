import { Timestamp } from 'firebase-admin/firestore';

import { ProposalFormat, ProposalStatus } from '../enums';
import { ProposalConsent } from './proposalConsent.entity';

export class Proposal {
  id: string;
  eventId: string;
  cfpId: string;
  ownerUserId: string;
  primarySpeakerProfileId: string;

  status: ProposalStatus;

  title: string;
  abstract: string;
  description: string | null;
  format: ProposalFormat;
  durationMinutes: number | null;
  language: string;
  consent: ProposalConsent | null;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  submittedAt: Timestamp | null;
  withdrawnAt: Timestamp | null;

  trackId: string | null;

  primarySpeakerSnapshot: {
    displayName: string;
    biography: string | null;
    organization: string | null;
    jobTitle: string | null;
    location: string | null;
    websiteUrl: string | null;
    pronouns: string | null;
  } | null;
}
