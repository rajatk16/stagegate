import { Timestamp } from "firebase-admin/firestore";

import { AuditEvent } from "../models";

export type AuditEventDocument = Omit<AuditEvent, 'occurredAt'> & {
  occurredAt: Timestamp
}
