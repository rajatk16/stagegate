import { Timestamp } from 'firebase-admin/firestore';

import { SpeakerProfile } from '../entities';
import { UpsertSpeakerProfileDto } from '../dtos';
import { createSpeakerProfileId } from '../utils';

export const createSpeakerProfileFactory = (
  eventId: string,
  userId: string,
  dto: UpsertSpeakerProfileDto,
): SpeakerProfile => {
  const now = Timestamp.now();

  return {
    userId,
    eventId,
    createdAt: now,
    updatedAt: now,
    displayName: dto.displayName.trim(),
    jobTitle: dto.jobTitle?.trim() ?? null,
    location: dto.location?.trim() ?? null,
    pronouns: dto.pronouns?.trim() ?? null,
    biography: dto.biography?.trim() ?? null,
    websiteUrl: dto.websiteUrl?.trim() ?? null,
    id: createSpeakerProfileId(eventId, userId),
    organization: dto.organization?.trim() ?? null,
  };
};
