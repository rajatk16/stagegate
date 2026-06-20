import { AuthenticatedUser } from '@/auth/interfaces/authenticatedUser.interface';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
