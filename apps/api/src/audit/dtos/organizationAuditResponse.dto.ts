export class OrganizationAuditEventResponseDto {
  eventId!: string;
  organizationId!: string;
  action!: string;
  actorUid!: string;
  occurredAt!: string;
  outcome!: 'succeeded';
  details!: Record<string, string | string[]>;
  actorDisplayName!: string | null;
  actorEmail!: string | null;
}

export class OrganizationAuditPageResponseDto {
  items!: OrganizationAuditEventResponseDto[];
  nextCursor!: string | null;
}
