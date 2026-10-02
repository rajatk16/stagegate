import { AuthenticatedRequest } from '../../auth/types';
import { OrganizationScope } from './organizationScope.type';

export interface OrganizationRequest extends AuthenticatedRequest {
  organizationScope?: OrganizationScope;
}
