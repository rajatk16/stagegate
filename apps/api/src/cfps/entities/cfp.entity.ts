import { Timestamp } from 'firebase-admin/firestore';

import { CfpStatus } from '../enums';
import { CfpConsentDefinition } from './cfpConsentDefinition.entity';
import { CfpTrack } from './cfpTrack.entity';

export class Cfp {
  id: string;
  eventId: string;

  status: CfpStatus;

  title: string;
  description: string | null;

  opensAt: Timestamp | null;
  closesAt: Timestamp | null;

  timezone: string;

  maxSubmissionsPerSpeaker: number;
  maxSpeakersPerSubmission: number;

  allowDrafts: boolean;
  allowEditsWhileOpen: boolean;
  allowWithdrawals: boolean;

  requiredConsent: CfpConsentDefinition | null;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  openedAt: Timestamp | null;
  closedAt: Timestamp | null;
  tracks: CfpTrack[];
}
