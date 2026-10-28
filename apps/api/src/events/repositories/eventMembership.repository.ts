import { Injectable } from '@nestjs/common';

import { EventMembership } from '../models';
import { eventMembershipConverter } from '../converters';
import { FirebaseService } from '../../firebase/services';
import { ORGANIZATIONS_COLLECTION } from '../../organizations/constants';
import { EVENT_MEMBERSHIPS_COLLECTION, EVENTS_COLLECTION } from '../constants';

@Injectable()
export class EventMembershipRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  getCollection(organizationId: string, eventId: string) {
    return this.firebaseService.firestore
      .collection(ORGANIZATIONS_COLLECTION)
      .doc(organizationId)
      .collection(EVENTS_COLLECTION)
      .doc(eventId)
      .collection(EVENT_MEMBERSHIPS_COLLECTION)
      .withConverter(eventMembershipConverter);
  }

  getDocumentReference(organizationId: string, eventId: string, uid: string) {
    return this.getCollection(organizationId, eventId).doc(uid);
  }

  async findByEventAndUser(
    organizationId: string,
    eventId: string,
    uid: string,
  ): Promise<EventMembership | null> {
    const snapshot = await this.getDocumentReference(
      organizationId,
      eventId,
      uid,
    ).get();
    return snapshot.data() ?? null;
  }
}
