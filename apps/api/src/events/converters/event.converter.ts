import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { Event, eventSchema } from '../models';
import { EVENTS_COLLECTION } from '../constants';
import { DiagnosticError } from '../../observalibility/errors';
import { ORGANIZATIONS_COLLECTION } from '../../organizations/constants';

export type EventDocument = Omit<Event, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const eventDocumentSchema = eventSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
});

const rejectPartialWrite = (options?: SetOptions): void => {
  if (options !== undefined) {
    throw new DiagnosticError('EVENT_PARTIAL_WRITE_UNSUPPORTED');
  }
};

const assertIdentity = (valid: boolean): void => {
  if (!valid) {
    throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
  }
};

export const eventConverter: FirestoreDataConverter<Event, EventDocument> = {
  toFirestore(value: unknown, options?: SetOptions): EventDocument {
    rejectPartialWrite(options);

    const event = eventSchema.parse(value);

    return {
      ...event,
      createdAt: Timestamp.fromDate(event.createdAt),
      updatedAt: Timestamp.fromDate(event.updatedAt),
    };
  },

  fromFirestore(snapshot): Event {
    const document = eventDocumentSchema.parse(snapshot.data());

    assertIdentity(
      snapshot.ref.path ===
        `${ORGANIZATIONS_COLLECTION}/${document.organizationId}/${EVENTS_COLLECTION}/${document.id}`,
    );

    return {
      ...document,
      createdAt: document.createdAt.toDate(),
      updatedAt: document.updatedAt.toDate(),
    };
  },
};
