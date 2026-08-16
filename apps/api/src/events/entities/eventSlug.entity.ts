import { Timestamp } from 'firebase-admin/firestore';

export class EventSlug {
  id: string;
  organizationId: string;
  slug: string;
  eventId: string;
  createdAt: Timestamp;
}
