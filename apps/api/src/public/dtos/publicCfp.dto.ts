import { PublicEventDto } from './publicEvent.dto';

export class PublicCfpDto {
  event: PublicEventDto;

  title: string;
  description: string | null;
  timezone: string;

  opensAt: string | null;
  closesAt: string | null;

  maxSubmissionsPerSpeaker: number;
  maxSpeakersPerSubmission: number;

  allowDrafts: boolean;
  allowEditsWhileOpen: boolean;
  allowWithdrawals: boolean;

  requiredConsent: {
    version: string;
    content: string;
  } | null;
}
