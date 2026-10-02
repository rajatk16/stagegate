import {
  ExecutionContext,
  createParamDecorator,
  InternalServerErrorException,
} from '@nestjs/common';

import { OrganizationRequest, OrganizationScope } from '../types';

export const CurrentOrganization = createParamDecorator(
  (_data: unknown, context: ExecutionContext): OrganizationScope => {
    const request = context.switchToHttp().getRequest<OrganizationRequest>();

    const scope = request.organizationScope;

    if (
      !scope ||
      scope.actorUid !== request.firebaseUser?.uid ||
      scope.organizationId !== request.params.organizationId
    ) {
      throw new InternalServerErrorException(
        'Organization scope was not resolved for this request.',
      );
    }

    return scope;
  },
);
