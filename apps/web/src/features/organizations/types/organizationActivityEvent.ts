export type OrganizationActivityEvent = {
  eventId: string;
  organizationId: string;
  action: string;
  actorUid: string;
  actorDisplayName: string | null;
  actorEmail: string | null;
  occurredAt: string;
  outcome: 'succeeded';
  details: Record<string, string | string[]>;
};
