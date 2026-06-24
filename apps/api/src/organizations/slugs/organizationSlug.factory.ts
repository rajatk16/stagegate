import { Timestamp } from 'firebase-admin/firestore';
import { OrganizationSlug } from './entities';

export const createOrganizationSlugFactory = (
  slug: string,
  organizationId: string,
): OrganizationSlug => ({
  slug,
  organizationId,
  createdAt: Timestamp.now(),
});
