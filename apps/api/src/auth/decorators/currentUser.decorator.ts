import { DecodedIdToken } from 'firebase-admin/auth';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedRequest } from '../types';
import { AuthException } from '../../common/exceptions';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DecodedIdToken => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.firebaseUser) {
      throw new AuthException('AUTH_REQUIRED');
    }

    return request.firebaseUser;
  },
);
