import { EVENT_ROLES } from '../enums';

export type EventAuthority =
  | {
      kind: 'ORGANIZATION_ADMIN';
    }
  | {
      kind: 'EVENT_MEMBER';
      role: EVENT_ROLES;
    }
  | {
      kind: 'ORGANIZATION_READER';
    };
