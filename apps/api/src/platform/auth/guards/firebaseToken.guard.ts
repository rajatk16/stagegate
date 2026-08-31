import { Reflector } from '@nestjs/core';
import { Auth, DecodedIdToken } from 'firebase-admin/auth';
import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';

import { FIREBASE_AUTH } from '@stagegate/backend-platform';

import { PUBLIC_ROUTE_KEY } from '../decorators';
import { AuthenticatedRequest, AuthenticationError } from '../types';

const INVALID_TOKEN_CODES = new Set([
  'auth/argument-error',
  'auth/invalid-argument',
  'auth/invalid-id-token',
  'auth/id-token-expired',
]);

@Injectable()
export class FirebaseTokenGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseTokenGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(FIREBASE_AUTH)
    private readonly firebaseAuth: Pick<Auth, 'verifyIdToken'>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    delete request.actor;

    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const token = this.extractBearerToken(request);

    let decoded: DecodedIdToken;

    try {
      decoded = await this.firebaseAuth.verifyIdToken(token);
    } catch (error) {
      const code =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        typeof error.code === 'string'
          ? error.code
          : undefined;

      if (code !== undefined && INVALID_TOKEN_CODES.has(code)) {
        throw new AuthenticationError('AUTH_INVALID_TOKEN');
      }

      this.logger.error('Firebase token verification failed unexpectedly.');

      throw new AuthenticationError('AUTH_UNAVAILABLE');
    }

    request.actor = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified === true,
      authTime: decoded.auth_time,
    };

    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string {
    const authorizationCount = request.rawHeaders.filter(
      (value, index) => index % 2 === 0 && value.toLowerCase() === 'authorization',
    ).length;

    if (authorizationCount === 0) {
      throw new AuthenticationError('AUTH_REQUIRED');
    }

    if (authorizationCount !== 1) {
      throw new AuthenticationError('AUTH_INVALID_TOKEN');
    }

    const header = request.headers.authorization;
    const match = header === undefined ? null : /^Bearer +([^\s,]+)$/i.exec(header);

    const token = match?.[1];

    if (token === undefined) {
      throw new AuthenticationError('AUTH_INVALID_TOKEN');
    }

    return token;
  }
}
