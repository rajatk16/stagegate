import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';

import { ErrorCode } from '@/common/enums';
import { ApplicationException } from '@/common/utils';

import { OrganizationLifecyclePolicyService } from '../services';
import {
  ORGANIZATION_CONTEXT_PARAM,
  ALLOW_ARCHIVED_ORGANIZATION_MUTATION,
} from '../decorators';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class OrganizationWritableGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationLifecyclePolicyService: OrganizationLifecyclePolicyService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) return true;

    const organizationContextParameter =
      this.reflector.getAllAndOverride<string>(ORGANIZATION_CONTEXT_PARAM, [
        context.getHandler(),
        context.getClass(),
      ]);

    if (!organizationContextParameter) return true;

    const allowArchivedMutation = this.reflector.getAllAndOverride<boolean>(
      ALLOW_ARCHIVED_ORGANIZATION_MUTATION,
      [context.getHandler(), context.getClass()],
    );

    if (allowArchivedMutation) return true;

    const requestContext = request.context;

    if (!requestContext?.organization)
      throw new ApplicationException(
        ErrorCode.UNAUTHENTICATED,
        HttpStatus.UNAUTHORIZED,
        'Organization context not found',
      );

    this.organizationLifecyclePolicyService.assertWriteable(
      requestContext.organization,
    );

    return true;
  }
}
