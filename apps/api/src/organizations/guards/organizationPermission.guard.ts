import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { OrganizationAccessService } from '../services/organizationAccess.service';
import { OrganizationPermission } from '../types/organizationPermission.type';
import { OrganizationRequest } from '../types/organizationRequest.type';
import {
  ORGANIZATION_SCOPE_KEY,
  ORGANIZATION_PERMISSIONS_KEY,
} from '../constants';

@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: OrganizationAccessService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const scoped =
      this.reflector.getAllAndOverride<boolean>(ORGANIZATION_SCOPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true;

    if (!scoped) {
      return true;
    }

    const request = context.switchToHttp().getRequest<OrganizationRequest>();

    const scope = request.organizationScope;

    const required = this.reflector.get<
      readonly OrganizationPermission[] | undefined
    >(ORGANIZATION_PERMISSIONS_KEY, context.getHandler());

    if (
      !scope ||
      !required ||
      required.length === 0 ||
      scope.actorUid !== request.firebaseUser?.uid ||
      scope.organizationId !== request.params.organizationId
    ) {
      throw new InternalServerErrorException(
        'Organization authorization was not initialized correctly.',
      );
    }

    this.access.assertPermissions(scope, required);

    return true;
  }
}
