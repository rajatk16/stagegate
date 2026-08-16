import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { SpeakerProfile } from '../entities';
import { createSpeakerProfileId } from '../utils';
import { speakerProfileConverter } from '../converters';
import { SPEAKER_PROFILES_COLLECTION } from '../constants';

@Injectable()
export class SpeakerProfileRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(SPEAKER_PROFILES_COLLECTION)
      .withConverter(speakerProfileConverter);
  }

  getDocumentReference(eventId: string, userId: string) {
    return this.collection().doc(createSpeakerProfileId(eventId, userId));
  }

  async findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<SpeakerProfile | null> {
    const snapshot = await this.getDocumentReference(eventId, userId).get();

    return snapshot.exists ? snapshot.data()! : null;
  }

  async create(profile: SpeakerProfile): Promise<void> {
    await this.getDocumentReference(profile.eventId, profile.userId).create(
      profile,
    );
  }

  async save(profile: SpeakerProfile): Promise<void> {
    await this.getDocumentReference(profile.eventId, profile.userId).set(
      profile,
    );
  }
}
