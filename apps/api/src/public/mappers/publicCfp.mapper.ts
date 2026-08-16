import { Cfp } from '@/cfps';
import { toIso } from '@/common';
import { Event } from '@/events';

import { PublicCfpDto } from '../dtos';
import { PublicEventMapper } from './publicEvent.mapper';

export class PublicCfpMapper {
  static toDto(cfp: Cfp, event: Event): PublicCfpDto {
    return {
      allowDrafts: cfp.allowDrafts,
      allowEditsWhileOpen: cfp.allowEditsWhileOpen,
      allowWithdrawals: cfp.allowWithdrawals,
      closesAt: toIso(cfp.closesAt),
      description: cfp.description ?? null,
      event: PublicEventMapper.toDto(event),
      maxSpeakersPerSubmission: cfp.maxSpeakersPerSubmission,
      maxSubmissionsPerSpeaker: cfp.maxSubmissionsPerSpeaker,
      opensAt: toIso(cfp.opensAt),
      requiredConsent: cfp.requiredConsent
        ? {
            version: cfp.requiredConsent.version,
            content: cfp.requiredConsent.content,
          }
        : null,
      timezone: cfp.timezone,
      title: cfp.title,
    };
  }
}
