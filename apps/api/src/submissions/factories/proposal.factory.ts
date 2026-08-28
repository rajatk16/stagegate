import { randomUUID } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';

import { Proposal } from '../entities';
import { ProposalStatus } from '../enums';
import { CreateProposalDraftDto } from '../dtos';

export const createProposalFactory = (
  eventId: string,
  ownerUserId: string,
  speakerProfileId: string,
  dto: CreateProposalDraftDto,
): Proposal => {
  const now = Timestamp.now();

  return {
    abstract: dto.abstract.trim(),
    cfpId: eventId,
    consent: null,
    createdAt: now,
    description: dto.description?.trim() ?? null,
    durationMinutes: dto.durationMinutes ?? null,
    eventId,
    format: dto.format,
    id: randomUUID(),
    language: dto.language.trim().toLowerCase(),
    ownerUserId,
    primarySpeakerProfileId: speakerProfileId,
    status: ProposalStatus.DRAFT,
    submittedAt: null,
    title: dto.title.trim(),
    updatedAt: now,
    withdrawnAt: null,
    primarySpeakerSnapshot: null,
    trackId: dto.trackId ?? null,
  };
};
