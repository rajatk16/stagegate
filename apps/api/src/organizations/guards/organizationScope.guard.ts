import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../../auth/constants';
import { AuthException } from '../../common';
import { OrganizationAccessService } from '../services';
import { OrganizationPermission, OrganizationRequest } from '../types';
import {
  ORGANIZATION_SCOPE_KEY,
  ORGANIZATION_PERMISSIONS_KEY,
} from '../constants';

@Injectable()
export class OrganizationScopeGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly access: OrganizationAccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<OrganizationRequest>();

    const targets = [context.getHandler(), context.getClass()];

    const scoped =
      this.reflector.getAllAndOverride<boolean>(
        ORGANIZATION_SCOPE_KEY,
        targets,
      ) === true;

    const required = this.reflector.get<
      readonly OrganizationPermission[] | undefined
    >(ORGANIZATION_PERMISSIONS_KEY, context.getHandler());

    const hasOrganizationParameter = Object.hasOwn(
      request.params,
      'organizationId',
    );

    if (!scoped) {
      if (hasOrganizationParameter || required !== undefined) {
        throw new InternalServerErrorException(
          'Organization routes must declare organization scope.',
        );
      }

      return true;
    }

    const isPublic =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets) ===
      true;

    if (isPublic) {
      throw new InternalServerErrorException(
        'Organization-scoped routes cannot be public.',
      );
    }

    if (!required || required.length === 0) {
      throw new InternalServerErrorException(
        'Organization routes must declare required permissions.',
      );
    }

    const user = request.firebaseUser;

    if (!user) {
      throw new AuthException('AUTH_REQUIRED');
    }

    request.organizationScope = await this.access.resolve(
      user.uid,
      request.params.organizationId,
    );

    return true;
  }
}
