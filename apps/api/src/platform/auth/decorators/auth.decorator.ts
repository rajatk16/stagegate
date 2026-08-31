import { createParamDecorator, type ExecutionContext, SetMetadata } from '@nestjs/common';

import { AuthenticationError } from '../utils';
import { type AuthenticatedUser, type AuthenticatedRequest } from '../types';

export const PUBLIC_ROUTE_KEY = Symbol('PUBLIC_ROUTE');

export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(PUBLIC_ROUTE_KEY, true);

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.actor === undefined) {
      throw new AuthenticationError('AUTH_REQUIRED');
    }

    return request.actor;
  },
);
