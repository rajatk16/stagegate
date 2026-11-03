import type { EventScope } from './eventScope.type';
import type { AuthenticatedRequest } from '../../auth/types/authenticatedRequest.type';

export interface EventRequest extends AuthenticatedRequest {
  eventScope?: EventScope;
}
