import type { Timestamp } from 'firebase-admin/firestore';

import type { AuditEvent } from '../models';

type WithFirestoreTimestamp<T> = T extends {
  occurredAt: Date;
}
  ? Omit<T, 'occurredAt'> & {
      occurredAt: Timestamp;
    }
  : never;

export type AuditEventDocument = WithFirestoreTimestamp<AuditEvent>;
