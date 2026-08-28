import { CfpStatus } from '../enums';
import { CfpConsentDefinition, CfpTrack } from '../entities';

export class CfpDetailsDto {
  eventId: string;
  status: CfpStatus;
  title: string;
  description: string | null;
  opensAt: string | null;
  closesAt: string | null;
  timezone: string;
  maxSubmissionsPerSpeaker: number;
  maxSpeakersPerSubmission: number;
  allowDrafts: boolean;
  allowEditsWhileOpen: boolean;
  allowWithdrawals: boolean;
  requiredConsent: CfpConsentDefinition | null;
  openedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tracks: CfpTrack[];
}
