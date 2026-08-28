import { toIso } from '@/common';

import { Cfp } from '../entities';
import { CfpDetailsDto } from '../dtos';

export class CfpMapper {
  static toDetailsDto = (cfp: Cfp): CfpDetailsDto => ({
    allowDrafts: cfp.allowDrafts,
    allowEditsWhileOpen: cfp.allowEditsWhileOpen,
    allowWithdrawals: cfp.allowWithdrawals,
    closedAt: toIso(cfp.closedAt),
    closesAt: toIso(cfp.closesAt),
    createdAt: toIso(cfp.createdAt)!,
    description: cfp.description ?? null,
    eventId: cfp.eventId,
    maxSpeakersPerSubmission: cfp.maxSpeakersPerSubmission,
    maxSubmissionsPerSpeaker: cfp.maxSubmissionsPerSpeaker,
    openedAt: toIso(cfp.openedAt),
    opensAt: toIso(cfp.opensAt),
    requiredConsent: cfp.requiredConsent ?? null,
    status: cfp.status,
    timezone: cfp.timezone,
    title: cfp.title,
    updatedAt: toIso(cfp.updatedAt)!,
    tracks: cfp.tracks,
  });
}
