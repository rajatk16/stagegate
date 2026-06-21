import { RequestContext } from '@/auth/interfaces';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}
