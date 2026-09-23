import { Response } from "express";
import { ThrottlerGuard, ThrottlerLimitDetail, ThrottlerRequest } from "@nestjs/throttler";
import { ExecutionContext, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";

import { AuthenticatedRequest } from "../types";
import { ApiException, AuthException } from "../../common";
import { IS_PUBLIC_KEY, SENSITIVE_ACTION_KEY } from "../constants";
import { SensitiveActionName, sensitiveActionPolicies } from "../policies";

abstract class SensitiveThrottleGuard extends ThrottlerGuard {
  protected abstract readonly bucket: 'ip' | 'user';

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();

    const action = this.reflector.get<SensitiveActionName>(
      SENSITIVE_ACTION_KEY,
      handler
    );

    if (action === undefined) return true;

    if (this.reflector.get<boolean>(IS_PUBLIC_KEY, handler) === true) {
      throw new InternalServerErrorException(
        'A sensitive action cannot be public.'
      );
    }

    return false;
  }

  protected async handleRequest(
    properties: ThrottlerRequest
  ): Promise<boolean> {
    if (properties.throttler.name !== this.bucket) {
      return true;
    }

    const action = this.reflector.get<SensitiveActionName>(
      SENSITIVE_ACTION_KEY, properties.context.getHandler()
    );

    if (!action) return true;

    const policy = sensitiveActionPolicies[action][this.bucket];

    let getTracker = properties.getTracker;

    if (this.bucket === 'user') {
      const request = properties.context.switchToHttp().getRequest<AuthenticatedRequest>();

      const uid = request.firebaseUser?.uid;

      if (!uid) {
        throw new AuthException('AUTH_REQUIRED');
      }

      getTracker = async () => `uid:${uid}`;
    }

    return super.handleRequest({
      ...properties,
      ...policy,
      getTracker
    });
  }

  protected async throwThrottlingException(context: ExecutionContext, detail: ThrottlerLimitDetail): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();

    response.setHeader('Retry-After', String(Math.max(1, Math.ceil(detail.timeToBlockExpire))));

    throw new ApiException(
      HttpStatus.TOO_MANY_REQUESTS, 
      'RATE_LIMIT_EXCEEDED', 
      'Too many requests. Try again later.'
    );
  }
}

@Injectable()
export class SensitiveIpThrottleGuard extends SensitiveThrottleGuard {
  protected readonly bucket: "ip";
}

@Injectable()
export class SensitiveUserThrottleGuard extends SensitiveThrottleGuard {
  protected readonly bucket = 'user';
}
