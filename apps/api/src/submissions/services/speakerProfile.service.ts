import { Timestamp } from 'firebase-admin/firestore';
import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';
import { ApplicationException, ErrorCode } from '@/common';

import { SpeakerProfile } from '../entities';
import { UpsertSpeakerProfileDto } from '../dtos';
import { SpeakerProfileMapper } from '../mappers';
import { createSpeakerProfileFactory } from '../factories';
import { SpeakerProfileRepository } from '../repositories';
import { SpeakerContextResolverService } from './speakerContextResolver.service';

@Injectable()
export class SpeakerProfileService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly speakerProfileRepository: SpeakerProfileRepository,
    private readonly speakerContextResolverService: SpeakerContextResolverService,
  ) {}

  async getMyProfile(eventPublicId: string, userId: string) {
    const { event } =
      await this.speakerContextResolverService.resolveAccessibleCfp(
        eventPublicId,
      );

    const profile = await this.speakerProfileRepository.findByEventAndUser(
      event.id,
      userId,
    );

    if (!profile) {
      throw new ApplicationException(
        ErrorCode.SPEAKER_PROFILE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Speaker profile not found',
      );
    }

    return SpeakerProfileMapper.toDto(profile);
  }

  async upsertProfile(
    eventPublicId: string,
    userId: string,
    dto: UpsertSpeakerProfileDto,
  ) {
    const { event } =
      await this.speakerContextResolverService.resolveOpenCfp(eventPublicId);

    return this.firebaseService.firestore.runTransaction(
      async (transaction) => {
        const profileRef = this.speakerProfileRepository.getDocumentReference(
          event.id,
          userId,
        );

        const profileSnapshot = await transaction.get(profileRef);

        if (!profileSnapshot.exists) {
          const profile = createSpeakerProfileFactory(event.id, userId, dto);

          transaction.set(profileRef, profile);

          return SpeakerProfileMapper.toDto(profile);
        }

        const existingProfile = profileSnapshot.data()!;

        const updatedProfile: SpeakerProfile = {
          ...existingProfile,
          displayName: dto.displayName?.trim() ?? null,
          biography: dto.biography?.trim() ?? null,
          organization: dto.organization?.trim() ?? null,
          jobTitle: dto.jobTitle?.trim() ?? null,
          location: dto.location?.trim() ?? null,
          websiteUrl: dto.websiteUrl?.trim() ?? null,
          pronouns: dto.pronouns?.trim() ?? null,
          updatedAt: Timestamp.now(),
        };

        transaction.set(profileRef, updatedProfile);
        return SpeakerProfileMapper.toDto(updatedProfile);
      },
    );
  }
}
