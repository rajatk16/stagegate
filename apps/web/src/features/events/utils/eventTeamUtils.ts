import {
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
): EventRole[] => {
  switch (authority.kind) {
    case 'ORGANIZATION_ADMIN':
      return ['MANAGER', 'REVIEW_CHAIR', 'REVIEWER'];
    case 'EVENT_MEMBER':
      switch (authority.role) {
        case 'MANAGER':
          return ['REVIEW_CHAIR', 'REVIEWER'];
        case 'REVIEW_CHAIR':
          return ['REVIEWER'];
        case 'REVIEWER':
          return [];
      }
    case 'ORGANIZATION_READER':
      return [];
  }
};
