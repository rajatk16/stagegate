import { RequestContext } from '@/auth';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}
