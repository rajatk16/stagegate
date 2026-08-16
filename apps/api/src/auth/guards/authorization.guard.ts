import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { RequestContext } from '@/auth';
import { ErrorCode, ApplicationException } from '@/common';

import { Permission } from '../types';
import { PERMISSIONS_KEY } from '../decorators';
import {
  EVENT_ROLE_PERMISSIONS,
  ORGANIZATION_ROLE_PERMISSIONS,
} from '../constants';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const requestContext = request.context;

    if (!requestContext) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Request context not found',
      );
    }

    const permissions = this.resolvePermissions(requestContext);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ApplicationException(
        ErrorCode.FORBIDDEN,
        HttpStatus.FORBIDDEN,
        'Insufficient permissions',
      );
    }

    return true;
  }

  private resolvePermissions(requestContext: RequestContext): Set<Permission> {
    const permissions = new Set<Permission>();

    if (requestContext.organizationMembership) {
      for (const role of requestContext.organizationMembership.roles) {
        const rolePermissions = ORGANIZATION_ROLE_PERMISSIONS[role] ?? [];

        rolePermissions.forEach((permission) => permissions.add(permission));
      }
    }

    if (requestContext.eventMembership) {
      const eventPermissions =
        EVENT_ROLE_PERMISSIONS[requestContext.eventMembership.role] ?? [];

      eventPermissions.forEach((permission) => permissions.add(permission));
    }

    return permissions;
  }
}
