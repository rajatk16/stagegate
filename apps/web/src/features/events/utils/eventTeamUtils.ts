import type {
  EventRole,
  EventAccess,
  EventAuthority,
  EventPermission,
} from '../types';

export const EVENT_ROLE_LABELS: Record<EventRole, string> = {
  MANAGER: 'Manager',
  REVIEW_CHAIR: 'Review chair',
  REVIEWER: 'Reviewer',
};

export const isEventRole = (value: unknown): value is EventRole =>
  value === 'MANAGER' || value === 'REVIEW_CHAIR' || value === 'REVIEWER';

export const hasEventPermission = (
  access: EventAccess,
  permission: EventPermission,
): boolean => access.permissions.includes(permission);

export const getGrantableEventRoles = (
  authority: EventAuthority,
): EventRole[] =>
  authority.kind === 'ORGANIZATION_ADMIN'
    ? ['MANAGER', 'REVIEW_CHAIR', 'REVIEWER']
    : [];

export const hasActiveEventAccess = (
  access: EventAccess,
  expectedUid: string,
): boolean => {
  if (!hasEventPermission(access, 'event:read')) {
    return false;
  }

  if (access.authority.kind === 'ORGANIZATION_ADMIN') {
    return true;
  }

  const membership = access.membership;

  return (
    membership !== null &&
    membership.uid === expectedUid &&
    membership.status === 'ACTIVE' &&
    membership.role === access.authority.role
  );
};
