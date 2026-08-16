import { Timestamp } from 'firebase-admin/firestore';

import { Event } from '@/events';

import { Cfp } from '../entities';
import { CfpStatus } from '../enums';
import { CreateCfpDto } from '../dtos';
import { createHash } from 'crypto';

export const createCfpFactory = (
  event: Event,
  actorUserId: string,
  dto: CreateCfpDto,
): Cfp => {
  const now = Timestamp.now();

  return {
    id: event.id,
    eventId: event.id,
    status: CfpStatus.DRAFT,
    title: dto.title.trim(),
    description: dto.description?.trim() || null,
    opensAt: dto.opensAt ? Timestamp.fromDate(new Date(dto.opensAt)) : null,
    closesAt: dto.closesAt ? Timestamp.fromDate(new Date(dto.closesAt)) : null,
    timezone: dto.timezone ?? event.timezone,
    maxSubmissionsPerSpeaker: dto.maxSubmissionsPerSpeaker,
    maxSpeakersPerSubmission: dto.maxSpeakersPerSubmission,
    allowDrafts: dto.allowDrafts,
    allowEditsWhileOpen: dto.allowEditsWhileOpen,
    allowWithdrawals: dto.allowWithdrawals,
    requiredConsent: dto.requiredConsent
      ? {
          version: dto.requiredConsent.version.trim(),
          content: dto.requiredConsent.content.trim(),
          contentHash: createHash('sha256')
            .update(dto.requiredConsent.content.trim(), 'utf-8')
            .digest('hex'),
        }
      : null,
    createdBy: actorUserId,
    createdAt: now,
    updatedAt: now,
    openedAt: null,
    closedAt: null,
  };
};
