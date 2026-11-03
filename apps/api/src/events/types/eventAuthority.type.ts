import { EVENT_ROLES } from '../enums/eventRoles.enum';

export type EventAuthority =
  | {
      kind: 'ORGANIZATION_ADMIN';
    }
  | {
      kind: 'EVENT_MEMBER';
      role: EVENT_ROLES;
    };
