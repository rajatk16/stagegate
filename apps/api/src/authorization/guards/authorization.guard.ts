import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Permission } from '../types';
import { PERMISSIONS_KEY } from '../decorators';
import { EventRole, OrganizationRole } from '../enums';
import { ORGANIZATION_ROLE_PERMISSIONS } from '../constants';
import { EVENT_ROLE_PERMISSIONS } from '../constants/eventRolePermissions';

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

    const organizationRoles = requestContext.organizationRoles ?? [];
    const eventRoles = requestContext.eventRoles ?? [];

    const permissions = this.getPermissions(organizationRoles, eventRoles);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      permissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }

  private getPermissions(
    organizationRoles: OrganizationRole[],
    eventRoles: EventRole[],
  ): Set<Permission> {
    const permissions = new Set<Permission>();

    for (const role of organizationRoles) {
      const rolePermissions = ORGANIZATION_ROLE_PERMISSIONS[role] ?? [];

      rolePermissions.forEach((permission) => permissions.add(permission));
    }

    for (const role of eventRoles) {
      const rolePermissions = EVENT_ROLE_PERMISSIONS[role] ?? [];

      rolePermissions.forEach((permission) => permissions.add(permission));
    }

    return permissions;
  }
}
