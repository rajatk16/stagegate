import { EVENT_ROLES } from '../enums/eventRoles.enum';
import { EventPermission } from '../types/eventPermission.type';

export const EVENTS_COLLECTION = 'events';

export const EVENTS_SLUG_COLLECTION = 'eventSlugs';

export const EVENT_MEMBERSHIPS_COLLECTION = 'eventMemberships';

export const EVENT_ROLE_PERMISSIONS: Readonly<
  Record<EVENT_ROLES, readonly EventPermission[]>
> = {
  REVIEWER: ['event:read'],
  REVIEW_CHAIR: ['event:read', 'event:members:read'],
  MANAGER: [
    'event:read',
    'event:update',
    'event:members:read',
    'event:manage-status',
  ],
};

export const ORGANIZATION_ADMIN_EVENT_PERMISSIONS: readonly EventPermission[] =
  [
    'event:read',
    'event:update',
    'event:members:read',
    'event:manage-status',
    'event:members:manage',
  ];

export const EVENT_SCOPE_KEY = 'event:scope';

export const EVENT_PERMISSIONS_KEY = 'event:requiredPermissions';
