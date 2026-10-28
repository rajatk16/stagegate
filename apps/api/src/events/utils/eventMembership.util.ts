import { EVENT_ROLES } from '../enums';
import { EventAuthority } from '../types';
import { EVENT_ROLE_GRANT_TARGETS } from '../constants';

export const canGrantEventRole = (
  authority: EventAuthority,
  role: EVENT_ROLES,
): boolean => {
  switch (authority.kind) {
    case 'ORGANIZATION_ADMIN':
      return true;
    case 'EVENT_MEMBER':
      return EVENT_ROLE_GRANT_TARGETS[authority.role].includes(role);
    case 'ORGANIZATION_READER':
      return false;
  }
};
