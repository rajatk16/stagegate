import { AuthenticatedRequest } from '../../auth/types/authenticatedRequest.type';
import { OrganizationScope } from './organizationScope.type';

export interface OrganizationRequest extends AuthenticatedRequest {
  organizationScope?: OrganizationScope;
}
