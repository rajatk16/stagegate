import { toIso } from '@/common';

import { SpeakerProfileDto } from '../dtos';
import { SpeakerProfile } from '../entities';

export class SpeakerProfileMapper {
  static toDto(profile: SpeakerProfile): SpeakerProfileDto {
    return {
      biography: profile.biography,
      createdAt: toIso(profile.createdAt)!,
      displayName: profile.displayName,
      id: profile.id,
      jobTitle: profile.jobTitle,
      location: profile.location,
      organization: profile.organization,
      pronouns: profile.pronouns,
      updatedAt: toIso(profile.updatedAt)!,
      websiteUrl: profile.websiteUrl,
    };
  }
}
