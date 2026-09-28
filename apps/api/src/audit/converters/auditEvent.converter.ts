import z from "zod";
import { FirestoreDataConverter, Timestamp, SetOptions } from "firebase-admin/firestore";

import { AuditEventDocument } from "../types";
import { AuditEvent, auditEventSchema } from "../models";

const documentSchema = auditEventSchema.extend({
  occurredAt: z.instanceof(Timestamp)
});

export const auditEventConverter: FirestoreDataConverter<AuditEvent, AuditEventDocument> = {
  toFirestore(
    value: unknown,
    options?: SetOptions
  ): AuditEventDocument {
    if (options !== undefined) {
      throw new Error('Partial audit writes are not supported');
    }

    const event = auditEventSchema.parse(value);

    return {
      ...event,
      occurredAt: Timestamp.fromDate(event.occurredAt)
    };
  },
  fromFirestore(snapshot): AuditEvent {
    const document = documentSchema.parse(snapshot.data());

    if (document.eventId !== snapshot.id) {
      throw new Error('Audit event ID does not match document ID');
    }

    return {
      ...document,
      occurredAt: document.occurredAt.toDate()
    };
  }
};
