import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { EVENTS_COLLECTION } from '../constants';
import { ORGANIZATIONS_COLLECTION } from '../../organizations/constants';
import { Event, eventObjectSchema, eventSchema } from '../models/event.model';
import { DiagnosticError } from '../../observalibility/errors/diagnostic.error';

export type EventDocument = Omit<
  Event,
  | 'createdAt'
  | 'updatedAt'
  | 'startsAt'
  | 'endsAt'
  | 'submissionOpensAt'
  | 'submissionClosesAt'
> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  startsAt: Timestamp | null;
  endsAt: Timestamp | null;
  submissionOpensAt: Timestamp | null;
  submissionClosesAt: Timestamp | null;
};

const eventDocumentSchema = eventObjectSchema.extend({
  createdAt: z.instanceof(Timestamp),
  updatedAt: z.instanceof(Timestamp),
  startsAt: z.instanceof(Timestamp).nullable().default(null),
  endsAt: z.instanceof(Timestamp).nullable().default(null),
  submissionOpensAt: z.instanceof(Timestamp).nullable().default(null),
  submissionClosesAt: z.instanceof(Timestamp).nullable().default(null),
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
      startsAt:
        event.startsAt === null ? null : Timestamp.fromDate(event.startsAt),
      endsAt: event.endsAt === null ? null : Timestamp.fromDate(event.endsAt),
      submissionOpensAt:
        event.submissionOpensAt === null
          ? null
          : Timestamp.fromDate(event.submissionOpensAt),

      submissionClosesAt:
        event.submissionClosesAt === null
          ? null
          : Timestamp.fromDate(event.submissionClosesAt),
    };
  },

  fromFirestore(snapshot): Event {
    const document = eventDocumentSchema.parse(snapshot.data());

    assertIdentity(
      snapshot.ref.path ===
        `${ORGANIZATIONS_COLLECTION}/${document.organizationId}/${EVENTS_COLLECTION}/${document.id}`,
    );

    return eventSchema.parse({
      ...document,
      createdAt: document.createdAt.toDate(),
      updatedAt: document.updatedAt.toDate(),
      endsAt: document.endsAt?.toDate() ?? null,
      startsAt: document.startsAt?.toDate() ?? null,
      submissionOpensAt: document.submissionOpensAt?.toDate() ?? null,
      submissionClosesAt: document.submissionClosesAt?.toDate() ?? null,
    });
  },
};
