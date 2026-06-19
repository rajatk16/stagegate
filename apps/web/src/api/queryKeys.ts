export const queryKeys = {
  organizations: ['organizations'],
  organization: (organizationId: string) => ['organization', organizationId],
  events: ['events'],
  event: (eventId: string) => ['event', eventId],
  proposals: ['proposals'],
  proposal: (proposalId: string) => ['proposal', proposalId],
};
