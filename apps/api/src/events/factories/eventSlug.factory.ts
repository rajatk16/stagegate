import { Timestamp } from 'firebase-admin/firestore';

import { EventSlug } from '../entities';
import { createEventSlugId } from '../utils';

export const createEventSlugFactory = (
  organizationId: string,
  slug: string,
  eventId: string,
): EventSlug => ({
  slug,
  eventId,
  organizationId,
  createdAt: Timestamp.now(),
  id: createEventSlugId(organizationId, slug),
});
