import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { OrganizationMembership } from '@/organizations';

export const CurrentOrganizationMembership = createParamDecorator(
  (_, context: ExecutionContext): OrganizationMembership | undefined =>
    context.switchToHttp().getRequest<Request>().context
      ?.organizationMembership,
);
