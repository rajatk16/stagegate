import { EVENT_ROLES } from '../enums';
import { EventPermission } from '../types';

export const EVENTS_COLLECTION = 'events';

export const EVENT_SLUGS_COLLECTION = 'eventSlugs';

export const EVENT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const EVENT_MEMBERSHIPS_COLLECTION = 'eventMemberships';

export const EVENT_ROLE_PERMISSIONS: Readonly<
  Record<EVENT_ROLES, readonly EventPermission[]>
> = {
  REVIEWER: ['event:read'],
  REVIEW_CHAIR: ['event:read', 'event:members:read'],
  MANAGER: [
    'event:read',
    'event:update',
    'event:manage-status',
    'event:members:read',
  ],
};

export const EVENT_ROLE_GRANT_TARGETS: Readonly<
  Record<EVENT_ROLES, readonly EVENT_ROLES[]>
> = {
  MANAGER: [EVENT_ROLES.REVIEW_CHAIR, EVENT_ROLES.REVIEWER],
  REVIEW_CHAIR: [EVENT_ROLES.REVIEWER],
  REVIEWER: [],
};

export const EVENT_SCOPE_KEY = 'event:scope';

export const EVENT_PERMISSIONS_KEY = 'event:requiredPermissions';
