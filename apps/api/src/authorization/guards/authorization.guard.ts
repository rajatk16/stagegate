import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { RequestContext } from '@/auth/interfaces';

import { Permission } from '../types';
import { PERMISSIONS_KEY } from '../decorators';
import { ORGANIZATION_ROLE_PERMISSIONS } from '../constants';

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
      throw new ForbiddenException('Request context not found');
    }

    const permissions = this.resolvePermissions(requestContext);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
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

    return permissions;
  }
}
