import { Injectable } from '@nestjs/common';

import { EventRole } from '@/auth';
import { FirebaseService } from '@/firebase';

import { EventMembership } from '../entities';
import { EventMembershipStatus } from '../enums';
import { createEventMembershipId } from '../utils';
import { eventMembershipConverter } from '../converters';
import { EVENT_MEMBERSHIPS_COLLECTION } from '../constants';

@Injectable()
export class EventMembershipRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(EVENT_MEMBERSHIPS_COLLECTION)
      .withConverter(eventMembershipConverter);
  }

  getDocumentReference(eventId: string, userId: string) {
    const id = createEventMembershipId(eventId, userId);

    return this.collection().doc(id);
  }

  async findByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventMembership | null> {
    const snapshot = await this.getDocumentReference(eventId, userId).get();

    return snapshot.exists ? snapshot.data()! : null;
  }

  async findActiveByEventAndUser(
    eventId: string,
    userId: string,
  ): Promise<EventMembership | null> {
    const membership = await this.findByEventAndUser(eventId, userId);

    return membership?.status === EventMembershipStatus.ACTIVE
      ? membership
      : null;
  }

  async findActiveByEvent(eventId: string): Promise<EventMembership[]> {
    const memberships = await this.collection()
      .where('eventId', '==', eventId)
      .where('status', '==', EventMembershipStatus.ACTIVE)
      .get();

    if (memberships.empty) return [];

    return memberships.docs.map((doc) => doc.data());
  }

  async create(membership: EventMembership): Promise<EventMembership> {
    await this.getDocumentReference(membership.eventId, membership.userId).set(
      membership,
    );

    return membership;
  }

  async save(membership: EventMembership): Promise<void> {
    await this.getDocumentReference(membership.eventId, membership.userId).set(
      membership,
    );
  }

  getActiveChairByEvent(eventId: string) {
    return this.collection()
      .where('eventId', '==', eventId)
      .where('status', '==', EventMembershipStatus.ACTIVE)
      .where('role', '==', EventRole.PROGRAM_CHAIR);
  }

  async findActiveReviewersByEvent(eventId: string) {
    const snapshot = await this.collection()
      .where('eventId', '==', eventId)
      .where('status', '==', EventMembershipStatus.ACTIVE)
      .where('role', '==', EventRole.REVIEWER)
      .get();

    return snapshot.docs.map((document) => document.data());
  }
}
