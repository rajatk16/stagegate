import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { EVENT_SLUGS_COLLECTION } from '../constants';
import { DiagnosticError } from '../../observalibility/errors';
import { ORGANIZATIONS_COLLECTION } from '../../organizations/constants';
import { EventSlugReservation, eventSlugReservationSchema } from '../models';

export type EventSlugReservationDocument = Omit<
  EventSlugReservation,
  'createdAt'
> & {
  createdAt: Timestamp;
};

const reservationDocumentSchema = eventSlugReservationSchema.extend({
  createdAt: z.instanceof(Timestamp),
});

const assertIdentity = (valid: boolean): void => {
  if (!valid) {
    throw new DiagnosticError('EVENT_STORAGE_INVARIANT_FAILED');
  }
};

const rejectPartialWrite = (options?: SetOptions): void => {
  if (options !== undefined) {
    throw new DiagnosticError('EVENT_PARTIAL_WRITE_UNSUPPORTED');
  }
};

export const eventSlugReservationConverter: FirestoreDataConverter<
  EventSlugReservation,
  EventSlugReservationDocument
> = {
  toFirestore(
    value: unknown,
    options?: SetOptions,
  ): EventSlugReservationDocument {
    rejectPartialWrite(options);
    const reservation = eventSlugReservationSchema.parse(value);

    return {
      ...reservation,
      createdAt: Timestamp.fromDate(reservation.createdAt),
    };
  },

  fromFirestore(snapshot): EventSlugReservation {
    const document = reservationDocumentSchema.parse(snapshot.data());

    assertIdentity(
      snapshot.ref.path ===
        `${ORGANIZATIONS_COLLECTION}/${document.organizationId}/${EVENT_SLUGS_COLLECTION}/${document.slug}`,
    );

    return {
      ...document,
      createdAt: document.createdAt.toDate(),
    };
  },
};
