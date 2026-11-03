import { DecodedIdToken } from 'firebase-admin/auth';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthException } from '../../common/exceptions/auth.exception';
import { AuthenticatedRequest } from '../types/authenticatedRequest.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DecodedIdToken => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.firebaseUser) {
      throw new AuthException('AUTH_REQUIRED');
    }

    return request.firebaseUser;
  },
);
