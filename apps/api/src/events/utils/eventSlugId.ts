import { createHash } from 'crypto';

export const createEventSlugId = (organizationId: string, slug: string) =>
  createHash('sha256').update(`${organizationId}\u0000${slug}`).digest('hex');
