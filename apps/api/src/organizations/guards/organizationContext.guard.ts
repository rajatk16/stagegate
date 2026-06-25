import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { OrganizationContextService } from '../services';
import { ORGANIZATION_CONTEXT_PARAM } from '../decorators';

@Injectable()
export class OrganizationContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly organizationContextService: OrganizationContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const parameterName = this.reflector.getAllAndOverride<string>(
      ORGANIZATION_CONTEXT_PARAM,
      [context.getHandler(), context.getClass()],
    );

    if (!parameterName) {
      return true;
    }

    const organizationIdentifier = request.params[parameterName] as string;

    if (!organizationIdentifier) {
      return true;
    }

    const requestContext = request.context;

    if (!requestContext) {
      throw new UnauthorizedException('Request context not found');
    }

    const { organization, organizationMembership } =
      await this.organizationContextService.resolve(
        organizationIdentifier,
        requestContext.user.userId,
      );

    requestContext.organization = organization;
    requestContext.organizationMembership = organizationMembership;

    return true;
  }
}
