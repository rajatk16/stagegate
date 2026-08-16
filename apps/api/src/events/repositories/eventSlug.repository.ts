import { Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';

import { EventSlug } from '../entities';
import { createEventSlugId } from '../utils';
import { eventSlugConverter } from '../converters';
import { EVENT_SLUGS_COLLECTION } from '../constants';

@Injectable()
export class EventSlugRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(EVENT_SLUGS_COLLECTION)
      .withConverter(eventSlugConverter);
  }

  getDocumentReference(organizationId: string, slug: string) {
    const id = createEventSlugId(organizationId, slug);

    return this.collection().doc(id);
  }

  async findBySlugAndOrganizationId(
    organizationId: string,
    slug: string,
  ): Promise<EventSlug | null> {
    const snapshot = await this.getDocumentReference(
      organizationId,
      slug,
    ).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as EventSlug;
  }
}
