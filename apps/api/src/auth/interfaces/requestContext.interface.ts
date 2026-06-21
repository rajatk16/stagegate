import { Role } from '@/authorization/enums';
import { AuthenticatedUser } from './authenticatedUser.interface';

export interface RequestContext {
  user: AuthenticatedUser;
  organizationId?: string;
  roles: Role[];
}
