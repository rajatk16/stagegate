import {
  createParamDecorator,
  type ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

import { type AuthenticatedRequest, type AuthenticatedUser } from '../types';
import { AuthenticationError } from '../utils';

export const PUBLIC_ROUTE_KEY = Symbol('PUBLIC_ROUTE');
export const VERIFIED_EMAIL_REQUIRED_KEY = Symbol('VERIFIED_EMAIL_REQUIRED');

export const Public = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(PUBLIC_ROUTE_KEY, true);

export const RequireVerifiedEmail = (): ReturnType<typeof SetMetadata> =>
  SetMetadata(VERIFIED_EMAIL_REQUIRED_KEY, true);

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.actor === undefined) {
      throw new AuthenticationError('AUTH_REQUIRED');
    }

    return request.actor;
  },
);
