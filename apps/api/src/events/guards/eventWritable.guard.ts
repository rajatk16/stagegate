import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { EventsDomainService } from '../services';
import { EVENT_CONTEXT_PARAM } from '../decorators';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class EventWritableGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventsDomainService: EventsDomainService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    const eventContextParameter = this.reflector.getAllAndOverride<string>(
      EVENT_CONTEXT_PARAM,
      [context.getHandler(), context.getClass()],
    );

    if (!eventContextParameter) {
      return true;
    }

    const event = request.context?.event;

    if (!event) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'Event context not found',
      );
    }

    this.eventsDomainService.assertEditable(event);

    return true;
  }
}
