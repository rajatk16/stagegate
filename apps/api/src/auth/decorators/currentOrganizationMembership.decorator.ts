import { OrganizationMembership } from '@/organizations/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentOrganizationMembership = createParamDecorator(
  (_, context: ExecutionContext): OrganizationMembership | undefined =>
    context.switchToHttp().getRequest<Request>().context
      ?.organizationMembership,
);
