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
  if (!hasEventPermission(access, 'event:read')) return false;

  if (access.authority.kind === 'ORGANIZATION_ADMIN') return true;

  const membership = access.membership;

  return (
    membership !== null &&
    membership.uid === expectedUid &&
    membership.role === access.authority.role &&
    membership.status === 'ACTIVE' &&
    membership.organizationStatus !== 'SUSPENDED' &&
    membership.effectiveStatus !== 'SUSPENDED'
  );
};

export const getEffectiveEventCapabilities = (
  access: EventAccess,
  expectedUid: string,
  eventStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  accessReady: boolean,
) => {
  const active = hasActiveEventAccess(access, expectedUid);
  const archived = eventStatus === 'ARCHIVED';

  const allows = (permission: EventPermission): boolean =>
    active && hasEventPermission(access, permission);

  const canRead = allows('event:read');
  const canReadTeam = allows('event:members:read');
  const canOpenSettings = allows('event:update');

  const canManageMembers = accessReady && allows('event:members:manage');

  return {
    canRead,
    canReadTeam,
    canOpenSettings,
    canManageMembers,
    canSuspendMembers: canManageMembers,
    canAddMembers: canManageMembers && !archived,
    canChangeMemberRoles: canManageMembers && !archived,
    canReactivateMembers: canManageMembers && !archived,
    canEditSettings: accessReady && canOpenSettings && !archived,
    canManageStatus: accessReady && allows('event:manage-status'),
  };
};

export type EffectiveEventCapabilities = ReturnType<
  typeof getEffectiveEventCapabilities
>;
