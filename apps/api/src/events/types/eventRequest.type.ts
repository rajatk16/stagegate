import type { EventScope } from './eventScope.type';
import type { AuthenticatedRequest } from '../../auth/types';

export interface EventRequest extends AuthenticatedRequest {
  eventScope?: EventScope;
}
