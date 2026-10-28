import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { EventAccessService } from '../services';
import { IS_PUBLIC_KEY } from '../../auth/constants';
import { AuthException } from '../../common/exceptions';
import type { EventPermission, EventRequest } from '../types';
import { EVENT_SCOPE_KEY, EVENT_PERMISSIONS_KEY } from '../constants';

@Injectable()
export class EventScopedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: EventAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    const scoped =
      this.reflector.getAllAndOverride<boolean>(EVENT_SCOPE_KEY, targets) ===
      true;

    const required = this.reflector.get<readonly EventPermission[] | undefined>(
      EVENT_PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!scoped) {
      if (required !== undefined) {
        throw new InternalServerErrorException(
          'Event permissions require event scope.',
        );
      }

      return true;
    }

    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets) ===
      true;

    if (isPublic || !required || required.length === 0) {
      throw new InternalServerErrorException(
        'Event routes must be private and declare permissions.',
      );
    }

    const request = context.switchToHttp().getRequest<EventRequest>();

    if (!request.firebaseUser) {
      throw new AuthException('AUTH_REQUIRED');
    }

    const scope = await this.access.resolve(
      request.firebaseUser.uid,
      request.params.organizationId,
      request.params.eventId as string,
    );

    this.access.assertPermissions(scope, required);

    request.eventScope = scope;

    return true;
  }
}
