import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { Reflector } from '@nestjs/core';
import { Auth, DecodedIdToken } from 'firebase-admin/auth';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { FIREBASE_AUTH } from '@stagegate/backend-platform';

import { AuthenticationError } from '../utils';
import { AuthenticatedRequest } from '../types';
import { PUBLIC_ROUTE_KEY } from '../decorators';
import { AuthenticationAuditWriter } from '../services';

interface VerificationFailure {
  clientCode:
    | 'AUTH_INVALID_TOKEN'
    | 'AUTH_TOKEN_EXPIRED'
    | 'AUTH_TOKEN_REVOKED'
    | 'AUTH_USER_DISABLED'
    | 'AUTH_UNAVAILABLE';
  reason:
    | 'token_invalid'
    | 'token_expired'
    | 'token_revoked'
    | 'token_user_missing'
    | 'user_disabled'
    | 'verification_unavailable';
}

const INVALID_TOKEN_CODES = new Set([
  'auth/argument-error',
  'auth/invalid-argument',
  'auth/invalid-id-token',
  'auth/mismatching-tenant-id',
]);

@Injectable()
export class FirebaseTokenGuard implements CanActivate {
  private readonly logger = new Logger(FirebaseTokenGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(FIREBASE_AUTH)
    private readonly firebaseAuth: Pick<Auth, 'verifyIdToken'>,
    private readonly audit: AuthenticationAuditWriter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<AuthenticatedRequest>();

    delete request.actor;

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic === true) {
      return true;
    }

    const response = http.getResponse<Response>();
    const requestId = this.ensureRequestId(response);
    const target = this.targetName(context);

    let token: string;

    try {
      token = this.extractBearerToken(request);
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        this.audit.recordDenied({
          requestId,
          target,
          actorId: null,
          reason:
            error.code === 'AUTH_REQUIRED'
              ? 'crendentials_missing'
              : 'crendentials_malformed',
        });
      }

      throw error;
    }

    let decoded: DecodedIdToken;

    try {
      decoded = await this.firebaseAuth.verifyIdToken(token, true);
    } catch (error: unknown) {
      const failure = this.mapVerificationFailure(error);

      this.audit.recordDenied({
        requestId,
        target,
        actorId: null,
        reason: failure.reason,
      });

      if (failure.clientCode === 'AUTH_UNAVAILABLE') {
        this.logger.error('Firebase token verification failed unexpectedly.');
      }

      throw new AuthenticationError(failure.clientCode);
    }

    request.actor = Object.freeze({
      uid: decoded.uid,
      email: decoded.email ?? null,
      emailVerified: decoded.email_verified === true,
      authTime: decoded.auth_time,
    });

    return true;
  }

  private extractBearerToken(request: AuthenticatedRequest): string {
    const authorizationCount = request.rawHeaders.filter(
      (value, index) =>
        index % 2 === 0 && value.toLowerCase() === 'authorization',
    ).length;

    if (authorizationCount === 0) {
      throw new AuthenticationError('AUTH_REQUIRED');
    }

    if (authorizationCount !== 1) {
      throw new AuthenticationError('AUTH_INVALID_TOKEN');
    }

    const header = request.headers.authorization;
    const match =
      header === undefined ? null : /^Bearer +([^\s,]+)$/i.exec(header);

    const token = match?.[1];

    if (token === undefined) {
      throw new AuthenticationError('AUTH_INVALID_TOKEN');
    }

    return token;
  }

  private mapVerificationFailure(error: unknown): VerificationFailure {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : undefined;

    switch (code) {
      case 'auth/id-token-expired':
        return {
          clientCode: 'AUTH_TOKEN_EXPIRED',
          reason: 'token_expired',
        };

      case 'auth/id-token-revoked':
        return {
          clientCode: 'AUTH_TOKEN_REVOKED',
          reason: 'token_revoked',
        };

      case 'auth/user-disabled':
        return {
          clientCode: 'AUTH_USER_DISABLED',
          reason: 'user_disabled',
        };

      case 'auth/user-not-found':
        return {
          clientCode: 'AUTH_INVALID_TOKEN',
          reason: 'token_user_missing',
        };

      case undefined:
      default:
        if (code !== undefined && INVALID_TOKEN_CODES.has(code)) {
          return {
            clientCode: 'AUTH_INVALID_TOKEN',
            reason: 'token_invalid',
          };
        }

        return {
          clientCode: 'AUTH_UNAVAILABLE',
          reason: 'verification_unavailable',
        };
    }
  }

  private ensureRequestId(response: Response): string {
    const existing = response.getHeader('X-Request-Id');

    if (typeof existing === 'string') {
      return existing;
    }

    const requestId = randomUUID();
    response.setHeader('X-Request-Id', requestId);

    return requestId;
  }

  private targetName(context: ExecutionContext): string {
    return `${context.getClass().name}.${context.getHandler().name}`;
  }
}
