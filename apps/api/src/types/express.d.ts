import { Role } from '@/authorization/enums';
import { AuthenticatedUser } from '@/auth/interfaces/authenticatedUser.interface';

declare global {
  namespace Express {
    interface Request {
      context: {
        user?: AuthenticatedUser;
        organizationId?: string;
        roles: Role[];
      };
    }
  }
}
