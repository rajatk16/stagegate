import type { Request } from 'express';

export interface AuthenticatedUser {
  readonly uid: string;
  readonly email: string | null;
  readonly emailVerified: boolean;
  readonly authTime: number;
}

export interface AuthenticatedRequest extends Request {
  actor?: AuthenticatedUser;
}
