import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthenticationError } from '../utils';
import { AuthenticatedRequest } from '../types';
import { VERIFIED_EMAIL_REQUIRED_KEY } from '../decorators';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(
      VERIFIED_EMAIL_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (required !== true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const actor = request.actor;

    if (actor === undefined) {
      throw new AuthenticationError('AUTH_REQUIRED');
    }

    if (actor.email === null || !actor.emailVerified) {
      throw new AuthenticationError('EMAIL_VERIFICATION_REQUIRED');
    }
    return true;
  }
}
