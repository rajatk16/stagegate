export interface EventMutationAuditInput {
  actorUid: string;
  organizationId: string;
  targetId: string;
  requestId: string;
  occurredAt: Date;
}
