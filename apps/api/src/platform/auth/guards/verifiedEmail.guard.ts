import { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { AuthenticationError } from '../utils';
import { AuthenticatedRequest } from '../types';
import { AuthenticationAuditWriter } from '../services';
import { VERIFIED_EMAIL_REQUIRED_KEY } from '../decorators';

@Injectable()
export class VerifiedEmailGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuthenticationAuditWriter,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(VERIFIED_EMAIL_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (required !== true) {
      return true;
    }

    const http = context.switchToHttp();
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const actor = request.actor;

    if (actor === undefined) {
      throw new AuthenticationError('AUTH_REQUIRED');
    }

    if (actor.email === null || !actor.emailVerified) {
      const response = http.getResponse<Response>();
      const requestId = response.getHeader('X-Request-Id');

      this.audit.recordDenied({
        requestId: typeof requestId === 'string' ? requestId : 'request-id-unavailable',
        target: `${context.getClass().name}.${context.getHandler().name}`,
        actorId: actor.uid,
        reason: 'email_unverified',
      });

      throw new AuthenticationError('EMAIL_VERIFICATION_REQUIRED');
    }
    return true;
  }
}
