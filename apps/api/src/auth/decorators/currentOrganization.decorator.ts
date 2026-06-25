import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Organization } from '@/organizations/entities';

export const CurrentOrganization = createParamDecorator(
  (_, context: ExecutionContext): Organization | undefined =>
    context.switchToHttp().getRequest<Request>().context?.organization,
);
