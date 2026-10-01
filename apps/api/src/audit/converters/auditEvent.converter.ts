import z from 'zod';
import {
  Timestamp,
  SetOptions,
  FirestoreDataConverter,
} from 'firebase-admin/firestore';

import { AuditEventDocument } from '../types';
import { AuditEvent, auditEventSchema } from '../models';

export const auditEventConverter: FirestoreDataConverter<
  AuditEvent,
  AuditEventDocument
> = {
  toFirestore(value: unknown, options?: SetOptions): AuditEventDocument {
    if (options !== undefined) {
      throw new Error('Partial audit writes are not supported');
    }

    const event = auditEventSchema.parse(value);

    return {
      ...event,
      occurredAt: Timestamp.fromDate(event.occurredAt),
    };
  },
  fromFirestore(snapshot): AuditEvent {
    const document = snapshot.data();

    const occurredAt = z.instanceof(Timestamp).parse(document.occurredAt);

    const event = auditEventSchema.parse({
      ...document,
      occurredAt: occurredAt.toDate(),
    });

    if (event.eventId !== snapshot.id) {
      throw new Error('Audit event Id does not match document ID');
    }

    return event;
  },
};
