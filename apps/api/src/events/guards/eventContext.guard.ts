import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { ErrorCode, ApplicationException } from '@/common';

import { EVENT_CONTEXT_PARAM } from '../decorators';
import { EventMembershipService, EventsService } from '../services';

@Injectable()
export class EventContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly eventService: EventsService,
    private readonly eventMembershipService: EventMembershipService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const parameterName = this.reflector.getAllAndOverride<string>(
      EVENT_CONTEXT_PARAM,
      [context.getHandler(), context.getClass()],
    );

    if (!parameterName) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const requestContext = request.context;

    if (!requestContext?.organization) {
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'Organization context not found',
      );
    }

    const eventSlug = request.params[parameterName] as string;

    const event = await this.eventService.findByOrganizationAndSlug(
      requestContext.organization.id,
      eventSlug,
    );

    const membership = await this.eventMembershipService.findActiveMembership(
      event.id,
      requestContext.user.userId,
    );

    if (!membership) {
      throw new ApplicationException(
        ErrorCode.EVENT_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Event not found',
      );
    }

    requestContext.event = event;
    requestContext.eventMembership = membership;

    return true;
  }
}
