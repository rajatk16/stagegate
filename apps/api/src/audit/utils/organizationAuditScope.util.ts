import type { AuditEvent } from '../models';

export const getAuditOrganizationId = (event: AuditEvent): string | null => {
  switch (event.action) {
    case 'user.profile.updated':
      return null;

    case 'organization.created':
    case 'organization.settings.updated':
      return event.targetId;

    default:
      return event.organizationId;
  }
};
