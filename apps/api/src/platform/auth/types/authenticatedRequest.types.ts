import type { Request } from 'express';

import { type AuthenticatedUser } from './authenticatedUser.types';

export interface AuthenticatedRequest extends Request {
  actor?: AuthenticatedUser;
}
