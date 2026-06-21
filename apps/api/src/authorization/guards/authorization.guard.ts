import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Permission, Role } from '../enums';
import { PERMISSIONS_KEY, ROLES_KEY } from '../decorators';
import { ROLE_PERMISSIONS } from '../constants';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    const userRoles: Role[] = request.context?.roles ?? [];

    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        throw new ForbiddenException('Insufficient role');
      }
    }

    if (requiredPermissions) {
      const userPermissions = userRoles.flatMap(
        (role) => ROLE_PERMISSIONS[role] ?? [],
      );

      const hasPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasPermissions) {
        throw new ForbiddenException('Insufficient role');
      }
    }

    return true;
  }
}
