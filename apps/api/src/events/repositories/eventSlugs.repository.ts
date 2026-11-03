import { Injectable } from '@nestjs/common';

import { EVENTS_SLUG_COLLECTION } from '../constants';
import { eventSlugReservationConverter } from '../converters/eventSlugReservation.converter';
import { OrganizationRepository } from '../../organizations/repositories/organizations.repository';

@Injectable()
export class EventSlugsRepository {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  private collection(organizationId: string) {
    return this.organizationRepository
      .getDocumentReference(organizationId)
      .collection(EVENTS_SLUG_COLLECTION)
      .withConverter(eventSlugReservationConverter);
  }

  getDocumentReference(organizationId: string, eventSlug: string) {
    return this.collection(organizationId).doc(eventSlug);
  }
}
