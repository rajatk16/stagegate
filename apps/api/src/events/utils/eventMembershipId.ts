import { createHash } from 'crypto';

export const createEventMembershipId = (
  eventId: string,
  userId: string,
): string => createHash('sha256').update(`${eventId}\0${userId}`).digest('hex');
