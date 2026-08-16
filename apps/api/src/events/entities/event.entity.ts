import { Timestamp } from 'firebase-admin/firestore';

import { EventStatus } from '../enums';

export class Event {
  id: string;

  organizationId: string;

  name: string;

  slug: string;

  // Immutable opaque identifier for future public routes.
  publicId: string;

  description?: string | null;

  timezone: string;

  startsAt?: Timestamp | null;

  endsAt?: Timestamp | null;

  status: EventStatus;

  publishedAt?: Timestamp | null;

  archivedAt?: Timestamp | null;

  createdBy: string;

  createdAt: Timestamp;

  updatedAt: Timestamp;
}
