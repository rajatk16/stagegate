import { HttpStatus, Injectable } from '@nestjs/common';

import { FirebaseService } from '@/firebase';
import { ErrorCode, ApplicationException } from '@/common';

import { Event } from '../entities';
import { eventConverter } from '../converters';
import { EVENTS_COLLECTION } from '../constants';
import { EventListOptions, EventListResult } from './types';

@Injectable()
export class EventRepository {
  constructor(private readonly firebaseService: FirebaseService) {}

  private collection() {
    return this.firebaseService.firestore
      .collection(EVENTS_COLLECTION)
      .withConverter(eventConverter);
  }

  getDocumentReference(eventId: string) {
    return this.collection().doc(eventId);
  }

  async create(event: Event): Promise<Event> {
    await this.getDocumentReference(event.id).create(event);

    return event;
  }

  async findById(eventId: string): Promise<Event | null> {
    const snapshot = await this.getDocumentReference(eventId).get();

    if (!snapshot.exists) {
      return null;
    }

    return snapshot.data() as Event;
  }

  async save(event: Event): Promise<void> {
    await this.getDocumentReference(event.id).set(event);
  }

  async findPageByOrganization(
    organizationId: string,
    options: EventListOptions,
  ): Promise<EventListResult<Event>> {
    const pageSize = Math.min(Math.max(options.limit, 1), 100);

    let query = this.collection()
      .where('organizationId', '==', organizationId)
      .orderBy('createdAt', 'desc')
      .limit(pageSize + 1);

    if (options.cursor) {
      const cursorSnapshot = await this.getDocumentReference(
        options.cursor,
      ).get();

      if (
        cursorSnapshot.exists &&
        cursorSnapshot.data()!.organizationId !== organizationId
      ) {
        throw new ApplicationException(
          ErrorCode.VALIDATION_ERROR,
          HttpStatus.BAD_REQUEST,
          'Invalid pagination cursor.',
        );
      }
      query = query.startAfter(cursorSnapshot);
    }

    const snapshot = await query.get();
    const items = snapshot.docs
      .slice(0, pageSize)
      .map((document) => document.data());

    const hasNextPage = snapshot.docs.length > pageSize;

    return {
      items,
      nextCursor: hasNextPage ? items.at(-1)?.id : undefined,
    };
  }

  async findByPublicId(publicId: string): Promise<Event | null> {
    const snapshot = await this.collection()
      .where('publicId', '==', publicId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data();
  }
}
