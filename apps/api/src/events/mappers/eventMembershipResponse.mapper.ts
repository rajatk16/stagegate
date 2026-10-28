import type { EventMembership } from '../models';

export const toEventMembershipResponse = (membership: EventMembership) => ({
  organizationId: membership.organizationId,
  eventId: membership.eventId,
  uid: membership.uid,
  role: membership.role,
  status: membership.status,
  createdAt: membership.createdAt.toISOString(),
  updatedAt: membership.updatedAt.toISOString(),
});
