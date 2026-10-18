import { Injectable } from '@nestjs/common';

import { EVENT_SLUGS_COLLECTION } from '../constants';
import { eventSlugReservationConverter } from '../converters';
import { OrganizationRepository } from '../../organizations/repositories';

@Injectable()
export class EventSlugsRepository {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  private collection(organizationId: string) {
    return this.organizationRepository
      .getDocumentReference(organizationId)
      .collection(EVENT_SLUGS_COLLECTION)
      .withConverter(eventSlugReservationConverter);
  }

  getDocumentReference(organizationId: string, eventSlug: string) {
    return this.collection(organizationId).doc(eventSlug);
  }
}
