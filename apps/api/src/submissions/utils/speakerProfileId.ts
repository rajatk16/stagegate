import { createHash } from 'crypto';

export const createSpeakerProfileId = (eventId: string, userId: string) =>
  createHash('sha256').update(`${eventId}\0${userId}`).digest('hex');
