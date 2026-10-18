import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthenticatedRequest } from '../types';
import { assertRecentAuthentication } from '../utils';
import { AuthException } from '../../common/exceptions';
import { REQUIRES_RECENT_AUTHENTICATION_KEY } from '../constants';

@Injectable()
export class RecentAuthenticationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(
      REQUIRES_RECENT_AUTHENTICATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (required !== true) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.firebaseUser) throw new AuthException('AUTH_REQUIRED');

    assertRecentAuthentication(request.firebaseUser.auth_time);

    return true;
  }
}
