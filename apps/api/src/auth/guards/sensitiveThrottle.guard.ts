import { isIP } from 'node:net';
import { Response } from 'express';
import {
  ThrottlerGuard,
  ThrottlerRequest,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import {
  Injectable,
  HttpStatus,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { AuthenticatedRequest } from '../types';
import { ApiException, AuthException } from '../../common';
import { SensitiveActionName, sensitiveActionPolicies } from '../policies';
import {
  IS_PUBLIC_KEY,
  SENSITIVE_ACTION_KEY,
  USER_WRITE_THROTTLE_KEY,
} from '../constants';

abstract class SensitiveThrottleGuard extends ThrottlerGuard {
  protected abstract readonly bucket: 'ip' | 'user';

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();

    const action = this.reflector.get<SensitiveActionName>(
      SENSITIVE_ACTION_KEY,
      handler,
    );

    const userWrite = this.reflector.get<boolean>(
      USER_WRITE_THROTTLE_KEY,
      handler,
    );

    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, handler);

    if (isPublic === true && (action !== undefined || userWrite === true)) {
      throw new InternalServerErrorException(
        'User write and sensitive-action policies require authentication.',
      );
    }

    if (this.bucket === 'ip') {
      return false;
    }

    return action === undefined && userWrite !== true;
  }

  protected async handleRequest(
    properties: ThrottlerRequest,
  ): Promise<boolean> {
    if (properties.throttler.name !== this.bucket) {
      return true;
    }

    const action = this.reflector.get<SensitiveActionName>(
      SENSITIVE_ACTION_KEY,
      properties.context.getHandler(),
    );

    const policy =
      action === undefined
        ? {
            limit: properties.limit,
            ttl: properties.ttl,
            blockDuration: properties.blockDuration,
          }
        : sensitiveActionPolicies[action][this.bucket];

    let getTracker = properties.getTracker;

    if (this.bucket === 'ip' && process.env.FLY_APP_NAME) {
      const request = properties.context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

      const clientIp = request.headers['fly-client-ip'];

      if (typeof clientIp !== 'string' || isIP(clientIp) === 0) {
        throw new ApiException(
          HttpStatus.SERVICE_UNAVAILABLE,
          'CLIENT_IP_UNAVAILABLE',
          'Unable to process this request.',
        );
      }

      getTracker = async () =>
        this.getTracker({
          ip: clientIp,
        });
    }

    if (this.bucket === 'user') {
      const request = properties.context
        .switchToHttp()
        .getRequest<AuthenticatedRequest>();

      const uid = request.firebaseUser?.uid;

      if (!uid) {
        throw new AuthException('AUTH_REQUIRED');
      }

      getTracker = async () => `uid:${uid}`;
    }

    return super.handleRequest({
      ...properties,
      ...policy,
      getTracker,
    });
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    detail: ThrottlerLimitDetail,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();

    response.setHeader(
      'Retry-After',
      String(Math.max(1, Math.ceil(detail.timeToBlockExpire))),
    );

    throw new ApiException(
      HttpStatus.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Try again later.',
    );
  }
}

@Injectable()
export class SensitiveIpThrottleGuard extends SensitiveThrottleGuard {
  protected readonly bucket = 'ip';
}

@Injectable()
export class SensitiveUserThrottleGuard extends SensitiveThrottleGuard {
  protected readonly bucket = 'user';
}
